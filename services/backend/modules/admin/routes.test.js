import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import router from "./routes.js";
import User from "../users/model.js";

let mongoServer;
let app;

const basePath = "/admin";

const detailsAdmin = {
  firstName: "BoAdmin",
  lastName: "BaAdmin",
  email: "testAdmin@example.com",
  password: "admin",
};

const details = {
  firstName: "Bo",
  lastName: "Ba",
  email: "test@example.com",
  password: "user",
};

describe("Admin routes", function () {
  // mongodb-memory-server can be a bit slow on first startup
  this.timeout(20000);

  before(async () => {
    // Start in-memory Mongo
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await User.syncIndexes();
    process.env.JWT_SECRET = "test-secret";
    app = express();
    app.use(express.json());
    app.use(basePath, router);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clear DB between tests
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  it("PUT /admin/:id update role to a user as admin should return 200", async () => {
    const admin = await User.create({ ...detailsAdmin, role: "admin" });
    const user = await User.create(details);

    const token = jwt.sign(
        { sub: admin._id.toString(), email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
    );

    const originalPassword = user.password;

    await request(app)
        .put(`${basePath}/${user._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ role: "admin" })
        .expect(200);

    const fresh = await User.findById(user._id);

    expect(fresh.firstName).to.equal(user.firstName);
    expect(fresh.password).to.equal(originalPassword);
    expect(fresh.role).to.equal("admin");
  });

  it("PUT /admin/:id update role to a user as user should return 403", async () => {
    const admin = await User.create({ ...detailsAdmin, role: "customer" });
    const user = await User.create(details);

    const token = jwt.sign(
        { sub: admin._id.toString(), email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
    );

    const originalPassword = user.password;

    await request(app)
        .put(`${basePath}/${user._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ role: "admin" })
        .expect(403);

    const fresh = await User.findById(user._id);

    expect(fresh.firstName).to.equal(user.firstName);
    expect(fresh.password).to.equal(originalPassword);
    expect(fresh.role).to.equal("customer");
  });

  it("PUT /admin/:id update password to a user as admin should return 403", async () => {
    const admin = await User.create({ ...detailsAdmin, role: "admin" });
    const user = await User.create(details);

    const token = jwt.sign(
        { sub: admin._id.toString(), email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
    );

    const originalPassword = user.password;

    await request(app)
        .put(`${basePath}/${user._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ password: "bla" })
        .expect(403);

    const fresh = await User.findById(user._id);

    expect(fresh.firstName).to.equal(user.firstName);
    expect(fresh.password).to.equal(originalPassword);
    expect(fresh.role).to.equal("customer");
  });

  it("PUT /admin/:id update user that do not excist as admin should return 404", async () => {
    const admin = await User.create({ ...detailsAdmin, role: "admin" });
    const user = await User.create(details);

    const token = jwt.sign(
        { sub: admin._id.toString(), email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
    );

    const missingId = new mongoose.Types.ObjectId().toString();
    const originalPassword = user.password;

    await request(app)
        .put(`${basePath}/${missingId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ role: "admin" })
        .expect(404);

    const fresh = await User.findById(user._id);

    expect(fresh.firstName).to.equal(user.firstName);
    expect(fresh.password).to.equal(originalPassword);
    expect(fresh.role).to.equal("customer");
  });
});