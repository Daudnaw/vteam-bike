import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

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
});
