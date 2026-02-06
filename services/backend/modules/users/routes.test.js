import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "./model.js";
import { v1 as usersV1Router } from "./routes.js";

let mongoServer;
let app;

const basePath = "/users";
const details = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "user",
};

describe("Users v1 routes", function () {
  // mongodb-memory-server can be a bit slow on first startup
  this.timeout(20000);

  before(async () => {
    // Start in-memory Mongo
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await User.syncIndexes();

    // Minimal express app mounting only the v1 users router
    app = express();
    app.use(express.json());
    app.use(basePath, usersV1Router);
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

  it("GET /users/:id should return a user as JSON", async () => {
    const user = new User(details);
    await user.save();

    const res = await request(app).get(`${basePath}/${user.id}`).expect(200);

    expect(res.body).to.include({
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
    });
    expect(res.body).to.have.property("_id", user.id);
  });
  
  it("GET /users/ returns empty array when there are no users", async () => {
    const res = await request(app)
      .get(`${basePath}/`)
      .expect(200);

    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(0);
  });

  it("GET /users/ returns all users as JSON without sensitive fields", async () => {
    const user1 = new User(details);
    const user2 = new User({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      password: "secret",
    });

    await user1.save();
    await user2.save();

    const res = await request(app)
      .get(`${basePath}/`)
      .expect(200);

    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(2);

    for (const u of res.body) {
      expect(u).to.have.property("_id");
      expect(u).to.have.property("firstName");
      expect(u).to.have.property("lastName");
      expect(u).to.have.property("email");

      expect(u).to.not.have.property("password");
      expect(u).to.not.have.property("salt");
    }
  });

  it("PUT /users/:id updates allowed fields but not password/role", async () => {
    const user = await User.create(details);

    const originalPassword = user.password;
    const originalRole = user.role;

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: "admin",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    const updatedData = {
      firstName: "Jane",
      lastName: "Smith",
      email: "new-email@example.com",
    };

    await request(app)
      .put(`${basePath}/${user._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    const updated = await User.findById(user._id);

    expect(updated.firstName).to.equal(updatedData.firstName);
    expect(updated.lastName).to.equal(updatedData.lastName);
    expect(updated.email).to.equal(updatedData.email);

    expect(updated.password).to.equal(originalPassword);
    expect(updated.role).to.equal(originalRole);
  });

  it("PUT /users/:id returns 403 when trying to update forbidden fields", async () => {
    const user = await User.create(details);

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    const forbiddenData = {
      firstName: "Jane",
      password: "new-secret",
      role: "admin",
    };

    const res = await request(app)
      .put(`${basePath}/${user._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send(forbiddenData)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Admins only/i);

    const fresh = await User.findById(user._id);

    expect(fresh.firstName).to.equal(user.firstName);
    expect(fresh.password).to.equal(user.password);
    expect(fresh.role).to.equal(user.role);
  });
});
