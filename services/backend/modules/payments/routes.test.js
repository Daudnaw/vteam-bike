import { expect } from "chai";
import request from "supertest";
import express from "express";

let app;
let router;

const basePath = "/payments";

describe("Payments routes", function () {
  this.timeout(20000);

  before(async () => {
    process.env.STRIPE_SECRET_KEY =
      process.env.STRIPE_SECRET_KEY || "sk_test_51ScB6U1SvvBu8btHrQZkwdC2SSIYkWTnotcN8y2xfZYo9SG291VuAd7v2Z5h0TOEMuqCjMjCdIOtdaKt1bK4lbrc00l8OzKGi6";

    const mod = await import("./routes.js");
    router = mod.default;

    app = express();
    app.use(express.json());
    app.use(basePath, router);
  });

  after(async () => {
  });

  it("POST /payments/checkout with allowed amount should return 200 and a url", async () => {
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .send({ amount: 300 })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.be.a("string");
    expect(res.body.url).to.include("https://");
  });

  it("POST /payments/checkout with disallowed amount should fall back to 100 and still return 200 and a url", async () => {
    const res = await request(app)
      .post(`${basePath}/checkout`)
      .send({ amount: 999 })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.be.a("string");
  });

  it("GET /payments/checkout/:id should return a normalized session payload", async () => {
    const checkoutRes = await request(app)
      .post(`${basePath}/checkout`)
      .send({ amount: 100 })
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
    const res = await request(app)
      .get(`${basePath}/stats/net-volume`)
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