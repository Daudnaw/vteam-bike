import { expect } from "chai";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import sinon from "sinon";
import esmock from "esmock";

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

    const requireAdmin = (req, res, next) => {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: admin access required" });
      }
      next();
    };

    const stripeMock = {
      checkout: {
        sessions: {
          create: sinon.stub().resolves({
            url: "https://checkout.stripe.com/c/pay/cs_test_123",
            id: "cs_test_123",
          }),
          retrieve: sinon.stub().resolves({
            id: "cs_test_123",
            amount_total: 10000,
            currency: "sek",
            payment_status: "paid",
            created: Math.floor(Date.now() / 1000),
            customer_details: { email: "test@test.se" },
            line_items: {
              data: [
                {
                  id: "li_1",
                  description: "Credit pot 100 kr",
                  quantity: 1,
                  amount_subtotal: 10000,
                  amount_total: 10000,
                },
              ],
            },
            payment_intent: null,
          }),
        },
      },
      balanceTransactions: {
        list: sinon.stub().resolves({
          data: [
            {
              created: Math.floor(Date.now() / 1000),
              amount: 10000,
              fee: 1000,
              net: 9000,
            },
          ],
        }),
      },
      subscriptions: {
        retrieve: sinon.stub().resolves({
          status: "active",
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        }),
      },
    };

    class StripeCtor {
      constructor() {
        return stripeMock;
      }
    }

    const mod = await esmock("./routes.js", {
      "../auth/middleware.js": { requireAuth, requireAdmin, issueAuthCookie: () => {} },
      "stripe": { default: StripeCtor },
    });

    router = mod.default;

    app = express();
    app.use(express.json());
    app.use(basePath, router);
  });

  it("POST /payments/checkout payment with allowed amount should return 200 and a url", async () => {
    const token = makeToken();

    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "payment", amount: 300 })
      .expect(200);

    expect(res.body).to.have.property("url");
    expect(res.body.url).to.include("https://");
  });

  it("POST /payments/checkout subscription small should return 200 and a url", async () => {
    const token = makeToken();

    const res = await request(app)
      .post(`${basePath}/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mode: "subscription", tier: "small" })
      .expect(200);

    expect(res.body).to.have.property("url");
  });

  it("GET /payments/checkout/:id should return a normalized session payload", async () => {
    const res = await request(app)
      .get(`${basePath}/checkout/cs_test_123`)
      .expect(200);

    expect(res.body).to.have.property("id", "cs_test_123");
    expect(res.body).to.have.property("line_items").that.is.an("array");
  });

  it("GET /payments/stats/net-volume should return aggregated stats", async () => {
    const token = makeToken();

    const res = await request(app)
      .get(`${basePath}/stats/net-volume`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.have.property("days").that.is.an("array");
    expect(res.body).to.have.property("currency");
  });
});