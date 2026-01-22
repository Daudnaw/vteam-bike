import { expect } from "chai";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

let app;
let router;

const basePath = "/payments";

function makeToken(overrides = {}) {
  return jwt.sign(
    {
      sub: "507f1f77bcf86cd799439011",
      email: "test@test.se",
      role: "admin",
      membership: { tier: "none", status: "inactive" },
      ...overrides,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

describe("Payments routes", function () {
  this.timeout(20000);

  before(async () => {
    process.env.JWT_SECRET = "test-secret";
  process.env.STRIPE_SECRET_KEY =
    process.env.STRIPE_SECRET_KEY ||
    "sk_test_51ScB6U1SvvBu8btHrQZkwdC2SSIYkWTnotcN8y2xfZYo9SG291VuAd7v2Z5h0TOEMuqCjMjCdIOtdaKt1bK4lbrc00l8OzKGi6";

  const mod = await import("./routes.js");
  router = mod.default;

  app = express();
  app.use(express.json());
  app.use(basePath, router);
  });

  after(async () => {
  });

  it('POST /payments/checkout payment with allowed amount should return 200 and a url', async () => {
    const token = makeToken();

    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "payment", amount: 300 })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.be.a("string");
    expect(res.body.url).to.include("https://");
  });

  it("POST /payments/checkout payment with disallowed amount should return 400", async () => {
    const token = makeToken();

    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "payment", amount: 9999 })
      .expect(400);

    expect(res.body).to.deep.equal({ error: "Invalid amount" });
  });

  it("POST /payments/checkout with invalid mode should return 400", async () => {
    const token = makeToken();
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "nope", amount: 100 })
      .expect(400);

    expect(res.body).to.deep.equal({ error: "Invalid mode" });
  });

  it("POST /payments/checkout subscription small should return 200 and a url", async () => {
    const token = makeToken();
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "subscription", tier: "small" })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.be.a("string");
    expect(res.body.url).to.include("https://");
  });

  it("POST /payments/checkout subscription allin should return 200 and a url", async () => {
    const token = makeToken();
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "subscription", tier: "allin" })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.be.a("string");
  });

  it("POST /payments/checkout subscription with invalid tier should return 400", async () => {
    const token = makeToken();
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "subscription", tier: "gold" })
      .expect(400);

    expect(res.body).to.deep.equal({ error: "Invalid tier" });
  });

  it("GET /payments/checkout/:id should return a normalized session payload", async () => {
    const token = makeToken();
    const checkoutRes = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "payment", amount: 100 })
      .expect(200);

    const { url } = checkoutRes.body;
    expect(url).to.be.a("string");

    const idMatch = url.match(/(cs_(test|live)_[^/?#]+)/);
    expect(idMatch, "Could not extract checkout session id from url").to.not.be.null;
    const sessionId = idMatch[1];

    const res = await request(app)
      .get(`${basePath}/checkout/${sessionId}`)
      .expect(200);

    expect(res.body).to.have.property("id").that.is.a("string");
    expect(res.body.id).to.equal(sessionId);

    expect(res.body).to.have.property("amount_total");
    expect(res.body).to.have.property("currency");
    expect(res.body).to.have.property("payment_status");
    expect(res.body).to.have.property("line_items");
    expect(res.body.line_items).to.be.an("array");
  });

  it("GET /payments/stats/net-volume should return aggregated stats", async () => {
    const token = makeToken();
    const res = await request(app)
      .get(`${basePath}/stats/net-volume`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.have.property("currency").that.is.a("string");
    expect(res.body).to.have.property("from");
    expect(res.body).to.have.property("to");
    expect(res.body).to.have.property("days");
    expect(res.body.days).to.be.an("array");

    if (res.body.days.length > 0) {
      const day = res.body.days[0];
      expect(day).to.have.property("date");
      expect(day).to.have.property("gross");
      expect(day).to.have.property("fee");
      expect(day).to.have.property("net");
      expect(day).to.have.property("count");
    }
  });
});