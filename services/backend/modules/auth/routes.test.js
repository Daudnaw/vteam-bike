import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import router from "./routes.js";
import User from "../users/model.js";

let mongoServer;
let app;

const basePath = "/auth";

const details = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "user",
};

describe("Auth routes", function () {
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

  it("POST /auth/register creates a user and strips sensitive fields", async () => {
    const res = await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    expect(res.body).to.include({
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
    });

    expect(res.body).to.have.property("_id");
    expect(res.body).to.not.have.property("password");
    expect(res.body).to.not.have.property("salt");
  });

  it("POST /auth/register returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post(`${basePath}/register`)
      .send({
        email: "missing-fields@example.com",
        // missing firstName, lastName, password
      })
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "firstName, lastName, email and password are required",
    );
  });

  it("POST /auth/login authenticates a registered user and returns token", async () => {
    // Register first
    await request(app).post(`${basePath}/register`).send(details).expect(201);

    // Then login
    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(200);

    expect(res.body).to.have.property("user");
    expect(res.body.user).to.include({
      email: details.email,
      firstName: details.firstName,
    });

    // Should not expose sensitive fields
    expect(res.body.user).to.not.have.property("password");
    expect(res.body.user).to.not.have.property("salt");

    // Token is placeholder for now, but should exist
    expect(res.body).to.have.property("token");
  });

  it("POST /auth/login returns 401 for wrong password", async () => {
    // Register a user
    await request(app).post(`${basePath}/register`).send(details).expect(201);

    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: "wrong-password",
      })
      .expect(401);

    // Your User.authenticate throws AuthenticationError('Invalid password')
    expect(res.body).to.have.property("message", "Invalid password");
  });

  it("POST /auth/login returns 401 for unknown email", async () => {
    const email = "no-such-user@example.com";

    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email,
        password: "whatever",
      })
      .expect(401);

    expect(res.body).to.have.property("message", `No such email: ${email}`);
  });

  it("PUT /auth/change-password updates the password and allows login with the new one", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const newPassword = "new-secret-password";

    const res = await request(app)
      .put(`${basePath}/change-password`)
      .send({
        email: details.email,
        oldPassword: details.password,
        newPassword,
      })
      .expect(200);

    expect(res.body).to.have.property(
      "message",
      "Password updated successfully",
    );
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.include({
      email: details.email,
      firstName: details.firstName,
    });
    expect(res.body.user).to.not.have.property("password");
    expect(res.body.user).to.not.have.property("salt");

    await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(401);

    const loginRes = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: newPassword,
      })
      .expect(200);

    expect(loginRes.body).to.have.property("user");
    expect(loginRes.body.user).to.include({
      email: details.email,
      firstName: details.firstName,
    });
    expect(loginRes.body.user).to.not.have.property("password");
    expect(loginRes.body.user).to.not.have.property("salt");
  });

  it("PUT /auth/change-password returns 400 when required fields are missing", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const res = await request(app)
      .put(`${basePath}/change-password`)
      .send({
        email: details.email,
      })
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "email, oldPassword and newPassword are required",
    );
  });

  it("PUT /auth/change-password returns 401 for wrong oldPassword", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const res = await request(app)
      .put(`${basePath}/change-password`)
      .send({
        email: details.email,
        oldPassword: "totally-wrong",
        newPassword: "new-secret",
      })
      .expect(401);

    expect(res.body).to.have.property("message", "Invalid password");
  });
});
