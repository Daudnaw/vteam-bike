import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { v1 as zoneV1Router } from "./routes.js";
import Zone from "./model.js";
import User from "../users/model.js";

let mongoServer;
let app;

const basePath = "/zones";
const details = {
  name: "stockholm parkering",
  type: "polygon",
  area: [
    [59.3430, 18.0600],
    [59.3380, 18.0850],
    [59.3300, 18.0750],
    [59.3210, 18.0650],
    [59.3230, 18.0450],
    [59.3360, 18.0450]
  ],
  active: true,
  zoneType: "parking",
};

describe("Zone v1 routes", function () {
  this.timeout(20000);

  before(async () => {
    process.env.JWT_SECRET = "testsecret";

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await Zone.syncIndexes();

    app = express();
    app.use(express.json());
    app.use(basePath, zoneV1Router);
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

  it("GET /zones should return all zones as JSON", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(1);

    expect(res.body[0]).to.include({
      name: "stockholm parkering",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });

    expect(res.body[0]).to.have.property("id", zone.id);
  });

  it("GET /zones should return 403", async () => {
    const user = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("GET /zones should return 401", async () => {
    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/`)
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("GET /zones/zonetype/:zoneType should return 403", async () => {
    const user = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/zonetype/${zone.zoneType}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("GET /zones/zonetype/:zoneType should return 401", async () => {
    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/${zone.zoneType}`)
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("GET /zones/zonetype/:zoneType should retun 400 'Invalid zone type'", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/zonetype/totalyworng`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.have.match(/Invalid zone type/);
  });

  it("GET /zones/zonetype/:zoneType should return 200", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/zonetype/${zone.zoneType}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(1);

    expect(res.body[0]).to.include({
      name: "stockholm parkering",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });
    expect(res.body[0]).to.have.property("id", zone.id);
  });

  it("GET /zones/:id should return 403", async () => {
    const user = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("GET /zones/:id should return 401", async () => {
    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/${zone.id}`)
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("GET /zones/:id should return 404 'Zone not found'", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`${basePath}/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Zone not found/);
  });

  it("GET /zones/:id should return 200", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = new Zone(details);
    await zone.save();

    const res = await request(app)
      .get(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.include({
      name: "stockholm parkering",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });

    expect(res.body).to.have.property("id", zone.id);
  });

  it("POST /zones should return 401 'Missing auth token'", async () => {
    const res = await request(app)
      .post(`${basePath}/`)
      .send(details)
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("POST /zones should return 403 'Forbidden: admin access required'", async () => {
    const user = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send(details)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("POST /zones should return 400 'name, type and zoneType are required'", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...details, type: null })
      .expect(400);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/name, type and zoneType are required/);
  });

  it("POST /zones should return 201 + zone", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send(details)
      .expect(201);

    expect(res.body).to.include({
      name: "stockholm parkering",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });

    expect(res.body).to.have.property("id");
  });

  it("PUT /zones/:id should return 401 'Missing auth token'", async () => {
    const zone = await Zone.create(details);

    const res = await request(app)
      .put(`${basePath}/${zone.id}`)
      .send({ name: "Updated name" })
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("PUT /zones/:id should return 403 'Forbidden: admin access required'", async () => {
    const user = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "user@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    const zone = await Zone.create(details);

    const res = await request(app)
      .put(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated name" })
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("PUT /zones/:id should return 404 'Zone not found'", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`${basePath}/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated name" })
      .expect(404);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Zone not found/);
  });

  it("PUT /zones/:id should return 200 + updated zone", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = await Zone.create(details);

    const res = await request(app)
      .put(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated parking zone" })
      .expect(200);

    expect(res.body).to.include({
      name: "Updated parking zone",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });

    expect(res.body).to.have.property("id", zone.id);
  });

  it("DELETE /zones/:id should return 401 'Missing auth token'", async () => {
    const zone = await Zone.create(details);

    const res = await request(app)
      .delete(`${basePath}/${zone.id}`)
      .expect(401);

    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/Missing auth token/);
  });

  it("DELETE /zones/:id should return 403 'Forbidden: admin access required'", async () => {
    const nonAdmin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "user@example.com",
      password: "user",
    });

    const token = jwt.sign(
      { id: nonAdmin.id, role: nonAdmin.role },
      process.env.JWT_SECRET
    );

    const zone = await Zone.create(details);

    const res = await request(app)
      .delete(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Forbidden: admin access required/);
  });

  it("DELETE /zones/:id should return 404 'Zone not found'", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`${basePath}/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body).to.have.property("error");
    expect(res.body.error).to.match(/Zone not found/);
  });

  it("DELETE /zones/:id should return 200 + deleted zone", async () => {
    const admin = await User.create({
      firstName: "Bo",
      lastName: "Ba",
      email: "admin@example.com",
      password: "user",
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET
    );

    const zone = await Zone.create(details);

    const res = await request(app)
      .delete(`${basePath}/${zone.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.include({
      name: "stockholm parkering",
      type: "polygon",
      active: true,
      zoneType: "parking",
    });
    expect(res.body).to.have.property("id", zone.id);

    const inDb = await Zone.findById(zone.id);
    expect(inDb).to.be.null;
  });
});