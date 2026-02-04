import { expect } from "chai";
import request from "supertest";
import express from "express";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import esmock from "esmock";

const basePath = "/rentals";

function makeToken(overrides = {}) {
  return jwt.sign(
    {
      sub: "507f1f77bcf86cd799439011",
      email: "test@test.se",
      role: "user",
      ...overrides,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function makeQuery(result) {
  return {
    populate() { return this; },
    sort() { return this; },
    lean: async () => result,
    exec: async () => result,
    then: (resolve) => Promise.resolve(result).then(resolve),
  };
}

describe("Rentals routes", function () {
  this.timeout(20000);

  let app;
  let router;

  let RentalMock;
  let UserMock;
  let ScooterMock;
  let sendCommandStub;
  let handelPriceStub;

  before(async () => {
    process.env.JWT_SECRET = "test-secret";

    const requireAuth = (req, res, next) => {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: "Missing auth token" });

      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    };

    sendCommandStub = sinon.stub();

    handelPriceStub = sinon.stub();

    RentalMock = {
      find: sinon.stub(),
      findById: sinon.stub(),
      findByIdAndDelete: sinon.stub(),
      findOne: sinon.stub(),
    };

    UserMock = {
      findById: sinon.stub(),
    };

    ScooterMock = {
      findById: sinon.stub(),
    };

    const mod = await esmock("./routes.js", {
      "../scooter/ws.js": { sendCommand: sendCommandStub },
      "../auth/middleware.js": { requireAuth },
      "../users/model.js": { default: UserMock },
      "../scooter/model.js": { default: ScooterMock },
      "./handelPayment.js": { default: handelPriceStub },
      "mongoose": {
        model: (name) => {
          if (name === "Rental") return RentalMock;
          throw new Error(`Unexpected model(${name})`);
        },
      },

    });

    router = mod.v1;

    app = express();
    app.use(express.json());
    app.use(basePath, router);
  });

  beforeEach(() => {
    sinon.resetHistory();
    UserMock.findById.reset();
    ScooterMock.findById.reset();
    RentalMock.find.reset();
    RentalMock.findById.reset();
    RentalMock.findByIdAndDelete.reset();
    RentalMock.findOne.reset();
    sendCommandStub.reset();
    handelPriceStub.reset();
  });

  it("GET /rentals should return 200 and list", async () => {
    const token = makeToken();
    const rentals = [{ _id: "r1" }, { _id: "r2" }];

    RentalMock.find.returns(makeQuery(rentals));

    const res = await request(app)
      .get(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.deep.equal(rentals);
    expect(RentalMock.find.calledOnce).to.equal(true);
  });

  it("GET /rentals/:id should return 404 when not found", async () => {
    const token = makeToken();
    RentalMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .get(`${basePath}/abc123`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body).to.deep.equal({ error: "Rental not found" });
  });

  it("POST /rentals should return 400 when scooter missing", async () => {
    const token = makeToken();

    UserMock.findById.returns(makeQuery({ _id: "u1" }));
    ScooterMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body).to.deep.equal({ error: "Scooter is required" });
  });

  it("POST /rentals should return 404 when user not found", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(404);

    expect(res.body).to.deep.equal({ error: "User not found" });
  });

  it("POST /rentals should return 404 when scooter not found", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery({ _id: "u1" }));
    ScooterMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(404);

    expect(res.body).to.deep.equal({ error: "Scooter not found" });
  });

  it("POST /rentals should return 409 when scooter not available", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery({ _id: "u1" }));
    ScooterMock.findById.returns(makeQuery({ _id: "s1", status: "offline" }));

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(409);

    expect(res.body).to.have.property("error", "Scooter is not available");
    expect(res.body).to.have.property("status", "offline");
  });

  it("PATCH /rentals/:id/end should return 403 when not owner", async () => {
    const token = makeToken({ sub: "u1" });

    RentalMock.findById.returns(makeQuery({ _id: "r1", user: "someone-else" }));

    const res = await request(app)
      .patch(`${basePath}/r1/end`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.deep.equal({ error: "Forbidden" });
  });

  it("PATCH /rentals/:id/end should return 200 immediately if already ended", async () => {
    const token = makeToken({ sub: "u1" });

    const ended = { _id: "r1", user: "u1", endTime: new Date().toISOString() };
    RentalMock.findById.returns(makeQuery(ended));

    const res = await request(app)
      .patch(`${basePath}/r1/end`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.deep.equal(ended);
  });

  it("PATCH /rentals/:id/end should return 409 if scooter offline (STOP not sent)", async () => {
    const token = makeToken({ sub: "u1" });

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      scooter: "s1",
      endTime: null,
    };

    RentalMock.findById.returns(makeQuery(rentalDoc));

    sendCommandStub.returns(0);

    const res = await request(app)
      .patch(`${basePath}/r1/end`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    expect(res.body).to.have.property("error");
  });

  it("PATCH /rentals/:id/end should debit credits and return 200", async () => {
    const token = makeToken({ sub: "u1" });

    const userDoc = { _id: "u1", credit: 100, save: sinon.stub().resolves() };

    const updatedRental = {
      _id: "r1",
      user: "u1",
      scooter: "s1",
      endTime: null,
      cost: 0,
      save: sinon.stub().resolves(),
    };

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      scooter: "s1",
      endTime: null,
      endRental: sinon.stub().resolves(updatedRental),
    };

    RentalMock.findById.resolves(rentalDoc);
    UserMock.findById.resolves(userDoc);
    sendCommandStub.returns(1);
    handelPriceStub.resolves({ cost: 50 });

    const res = await request(app)
      .patch(`${basePath}/r1/end`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(userDoc.credit).to.equal(50);
    expect(userDoc.save.calledOnce).to.equal(true);

    expect(updatedRental.cost).to.equal(50);
    expect(updatedRental.save.calledOnce).to.equal(true);
  });

  it("POST /rentals/app should return 400 when scooter missing", async () => {
    const token = makeToken({ sub: "u1" });

    const res = await request(app)
      .post(`${basePath}/app`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body).to.deep.equal({ error: "Scooter is required" });
    expect(UserMock.findById.called).to.equal(false);
    expect(ScooterMock.findById.called).to.equal(false);
  });

  it("POST /rentals/app should return 404 when user not found", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .post(`${basePath}/app`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(404);

    expect(res.body).to.deep.equal({ error: "User not found" });
    expect(UserMock.findById.calledOnceWith("u1")).to.equal(true);
    expect(ScooterMock.findById.called).to.equal(false);
  });

  it("POST /rentals/app should return 404 when scooter not found", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery({ _id: "u1" }));
    ScooterMock.findById.returns(makeQuery(null));

    const res = await request(app)
      .post(`${basePath}/app`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(404);

    expect(res.body).to.deep.equal({ error: "Scooter not found" });
    expect(UserMock.findById.calledOnceWith("u1")).to.equal(true);
    expect(ScooterMock.findById.calledOnceWith("s1")).to.equal(true);
  });

  it("POST /rentals/app should return 409 when scooter not idle", async () => {
    const token = makeToken({ sub: "u1" });

    UserMock.findById.returns(makeQuery({ _id: "u1" }));
    ScooterMock.findById.returns(makeQuery({ _id: "s1", status: "offline" }));

    const res = await request(app)
      .post(`${basePath}/app`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scooter: "s1" })
      .expect(409);

    expect(res.body).to.deep.equal({
      error: "Scooter is not available",
      status: "offline",
    });
  });

  it("PATCH /rentals/:id/end/app should return 404 when rental not found", async () => {
    const token = makeToken({ sub: "u1" });

    RentalMock.findById.resolves(null);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body).to.deep.equal({ error: "Rental not found" });
    expect(RentalMock.findById.calledOnceWith("r1")).to.equal(true);
  });

  it("PATCH /rentals/:id/end/app should return 403 when not owner", async () => {
    const token = makeToken({ sub: "u1" });

    const rentalDoc = { _id: "r1", user: "someone-else" };
    RentalMock.findById.resolves(rentalDoc);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).to.deep.equal({ error: "Forbidden" });
  });

  it("PATCH /rentals/:id/end/app should return 200 immediately if already ended", async () => {
    const token = makeToken({ sub: "u1" });

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      endTime: new Date().toISOString(),
    };

    RentalMock.findById.resolves(rentalDoc);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.deep.equal(rentalDoc);
  });

  it("PATCH /rentals/:id/end/app should return 404 when user not found after ending", async () => {
    const token = makeToken({ sub: "u1" });

    const updatedRental = {
      _id: "r1",
      user: "u1",
      endTime: new Date().toISOString(),
      cost: 0,
      save: sinon.stub().resolves(),
    };

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      endTime: null,
      endRental: sinon.stub().resolves(updatedRental),
    };

    RentalMock.findById.resolves(rentalDoc);
    handelPriceStub.resolves({ cost: 50 });
    UserMock.findById.resolves(null);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body).to.deep.equal({ error: "User not found" });
    expect(rentalDoc.endRental.calledOnce).to.equal(true);
    expect(handelPriceStub.calledOnceWith(updatedRental)).to.equal(true);
    expect(UserMock.findById.calledOnceWith("u1")).to.equal(true);
  });

  it("PATCH /rentals/:id/end/app should return 402 when user has too little credits", async () => {
    const token = makeToken({ sub: "u1" });

    const updatedRental = {
      _id: "r1",
      user: "u1",
      endTime: new Date().toISOString(),
      cost: 0,
      save: sinon.stub().resolves(),
    };

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      endTime: null,
      endRental: sinon.stub().resolves(updatedRental),
    };

    RentalMock.findById.resolves(rentalDoc);
    handelPriceStub.resolves({ cost: 80 });

    const userDoc = { _id: "u1", credit: 50, save: sinon.stub().resolves() };
    UserMock.findById.resolves(userDoc);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(402);

    expect(res.body).to.deep.equal({
      error: "Too little credits",
      cost: 80,
      credit: 50,
    });

    expect(userDoc.save.called).to.equal(false);
    expect(updatedRental.save.called).to.equal(false);
  });

  it("PATCH /rentals/:id/end/app should debit credits, set rental cost and return 200", async () => {
    const token = makeToken({ sub: "u1" });

    const updatedRental = {
      _id: "r1",
      user: "u1",
      endTime: new Date().toISOString(),
      cost: 0,
      save: sinon.stub().resolves(),
    };

    const rentalDoc = {
      _id: "r1",
      user: "u1",
      endTime: null,
      endRental: sinon.stub().resolves(updatedRental),
    };

    RentalMock.findById.resolves(rentalDoc);
    handelPriceStub.resolves({ cost: 40 });

    const userDoc = { _id: "u1", credit: 100, save: sinon.stub().resolves() };
    UserMock.findById.resolves(userDoc);

    const res = await request(app)
      .patch(`${basePath}/r1/end/app`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(userDoc.credit).to.equal(60);
    expect(userDoc.save.calledOnce).to.equal(true);

    expect(updatedRental.cost).to.equal(40);
    expect(updatedRental.save.calledOnce).to.equal(true);

    expect(res.body).to.include({ _id: "r1", user: "u1", cost: 40 });
  });
});