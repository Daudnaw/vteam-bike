import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Location from "./model.js";
import { v1 as locationV1Router } from "./routes.js";

let mongoServer;
let app;

const basePath = "/v1/location";

describe("Location v1 routes", function () {
  this.timeout(20000);

  before(async () => {
    // Starta in-memory Mongo
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await Location.syncIndexes();

    // Minimal express-app med endast location router
    app = express();
    app.use(express.json());
    app.use(basePath, locationV1Router);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // clean db between tests
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  describe("POST /v1/location/:scooterId", () => {
    it("should create a new location if it does not exist", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`${basePath}/${scooterId}`)
        .send({ lat: 59.0, lng: 18.0 })
        .expect(200);

      expect(res.body.current).to.include({ lat: 59.0, lng: 18.0 });

      const locInDb = await Location.findOne({ scooterId });
      expect(locInDb).to.exist;
      expect(locInDb.current.lat).to.equal(59.0);
    });

    it("should return 400 if lat or lng is missing", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`${basePath}/${scooterId}`)
        .send({ lat: "not a number", lng: 18 })
        .expect(400);

      expect(res.body).to.have.property("error");
    });

    it("should add new position to existing location", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      const loc = new Location({
        scooterId,
        current: { lat: 59.0, lng: 18.0 },
        history: [],
      });
      await loc.save();

      const res = await request(app)
        .post(`${basePath}/${scooterId}`)
        .send({ lat: 60.0, lng: 19.0 })
        .expect(200);

      expect(res.body.current).to.include({ lat: 60.0, lng: 19.0 });

      const updated = await Location.findOne({ scooterId });
      expect(updated.history).to.have.length(1);
      expect(updated.history[0].lat).to.equal(59.0);
    });
  });

  describe("GET /v1/location/:scooterId", () => {
    it("should return 404 if location not found", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      await request(app).get(`${basePath}/${scooterId}`).expect(404);
    });

    it("should return current position if found", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      const loc = new Location({
        scooterId,
        current: { lat: 59.0, lng: 18.0 },
        history: [],
      });
      await loc.save();

      const res = await request(app)
        .get(`${basePath}/${scooterId}`)
        .expect(200);

      expect(res.body).to.include({ lat: 59.0, lng: 18.0 });
    });
  });

  describe("GET /v1/location/:scooterId/history", () => {
    it("should return 404 if location not found", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      await request(app).get(`${basePath}/${scooterId}/history`).expect(404);
    });

    it("should return full history if found", async () => {
      const scooterId = new mongoose.Types.ObjectId();

      const loc = new Location({
        scooterId,
        current: { lat: 59.0, lng: 18.0 },
        history: [{ lat: 58.0, lng: 17.0 }],
      });
      await loc.save();

      const res = await request(app)
        .get(`${basePath}/${scooterId}/history`)
        .expect(200);

      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.include({ lat: 58.0, lng: 17.0 });
    });
  });
});
