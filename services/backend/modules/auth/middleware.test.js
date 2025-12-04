import { expect } from "chai"
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "./middleware.js";

describe("requireAuth middleware", function () {
  let app;

  before(() => {
      process.env.JWT_SECRET = "test-secret";

      app = express();

      app.get("/protected", requireAuth, (req, res) => {
          res.status(200).json({
              message: "OK",
              user: req.user,
          });
      });
  });

  it("returns 401 with 'missing auth token'", async () => {
    const res = await request(app)
      .get("/protected")
      .expect(401);

      expect(res.body).to.have.property("message", "Missing auth token");
  });

  it("return 401 with 'Invalid or expired token' when token is invalid", async () => {
    const invalidToken = "hello.invalid.token";
    
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(401);

    expect(res.body).to.have.property("message", "Invalid or expired token");
  });

  it("allows request and sets req.user when token is valid", async () => {
    const payload = { sub: "123", email: "test@example.com", role: "customer" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.have.property("message", "OK");
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.include({
      sub: "123",
      email: "test@example.com",
      role: "customer",
    });
  });
})