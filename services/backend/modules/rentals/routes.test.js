import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Rental from "./model.js";
import User from "../users/model.js";
import Location from "../locations/model.js";
import { v1 as rentalV1Router } from "./routes.js";

// Dummy Scooter
const scooterSchema = new mongoose.Schema({
  name: String,
  status: String,
});
const Scooter = mongoose.model("Scooter", scooterSchema);

const baseUser = {
  firstName: "Test",
  lastName: "User",
  email: "test@test.com",
  password: "123456",
};
const baseScooter = {
  name: "S1",
  status: "idle",
};

const baseLocation = (scooterId) => ({
  scooterId,
  current: { lat: 59, lng: 18 },
  history: [{ lat: 58, lng: 17 }],
});

let mongoServer;
let app;

const basePath = "/v1/rentals";

describe("Rental v1 routes", function () {
  this.timeout(20000);

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await Rental.syncIndexes();
    await User.syncIndexes();
    await Location.syncIndexes();
    await Scooter.syncIndexes();

    app = express();
    app.use(express.json());
    app.use(basePath, rentalV1Router);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  describe("POST /v1/rentals", () => {
    it("should create a new rental", async () => {
      const user = await User.create({
        ...baseUser
      });

      const scooter = await Scooter.create(baseScooter);

      await Location.create(baseLocation(scooter._id));

      const res = await request(app)
        .post(basePath)
        .send({ user: user._id, scooter: scooter._id })
        .expect(200);

      expect(res.body).to.have.property("_id");
      expect(res.body.user).to.equal(user._id.toString());
      expect(res.body.scooter).to.equal(scooter._id.toString());
    });
  });


  describe("GET /v1/rentals", () => {
    it("should return rentals with populated user and scooter", async () => {
      const user = await User.create({
        ...baseUser
      });

      const scooter = await Scooter.create(baseScooter);

      await Location.create(baseLocation(scooter._id));

      await Rental.create({ user: user._id, scooter: scooter._id });

      const res = await request(app).get(basePath).expect(200);
      expect(res.body[0].user.firstName).to.equal("Test");
      expect(res.body[0].scooter.name).to.equal("S1");
    });
  });

  describe("GET /v1/rentals/user/:userId", () => {
    it("should return rentals for a specific user", async () => {
      const u1 = await User.create({
        firstName: "U1",
        lastName: "Test",
        email: "u1@test.com",
        password: "123",
      });

      const u2 = await User.create({
        firstName: "U2",
        lastName: "Test",
        email: "u2@test.com",
        password: "123",
      });

      const s1 = await Scooter.create({ name: "S1", status: "active" });

      await Location.create({
        scooterId: s1._id,
        current: { lat: 59, lng: 18 },
        history: [],
      });

      await Rental.create({ user: u1._id, scooter: s1._id });
      await Rental.create({ user: u2._id, scooter: s1._id });

      const res = await request(app)
        .get(`${basePath}/user/${u1._id}`)
        .expect(200);

      expect(res.body.length).to.equal(1);
      expect(res.body[0].user.firstName).to.equal("U1");
    });
  });

  describe("GET /v1/rentals/user/:userId/latest", () => {
    it("should return the latest rental for a user", async () => {
      const user = await User.create({
        ...baseUser
      });

      const scooter = await Scooter.create({ name: "S", status: "idle" });

      await Location.create(baseLocation(scooter._id));

      const r1 = await Rental.create({
        user: user._id,
        scooter: scooter._id,
        startTime: new Date(Date.now() - 100000),
      });

      const r2 = await Rental.create({
        user: user._id,
        scooter: scooter._id,
        startTime: new Date(),
      });

      const res = await request(app)
        .get(`${basePath}/user/${user._id}/latest`)
        .expect(200);

      expect(res.body._id).to.equal(r2._id.toString());
    });
  });

  describe("PATCH /v1/rentals/:id/end", () => {
    it("should end the rental and set endTime + cost", async () => {
      const user = await User.create({
        ...baseUser
      });

      const scooter = await Scooter.create({ name: "S", status: "idle" });

      await Location.create({
        scooterId: scooter._id,
        current: { lat: 59, lng: 18 },
        history: [{ lat: 58, lng: 17 }],
      });

      const rental = await Rental.create({
        user: user._id,
        scooter: scooter._id,
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        startHistoryIndex: 0,
      });

      const res = await request(app)
        .patch(`${basePath}/${rental._id}/end`)
        .expect(200);

      expect(res.body.endTime).to.exist;
      expect(res.body.cost).to.be.greaterThan(0);
      expect(res.body.tripHistory).to.be.an("array");
      expect(res.body.tripHistory[0].lat).to.equal(58);
    });
  });
});
