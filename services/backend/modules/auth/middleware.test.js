import { expect } from "chai";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import { requireAuth, requireAdmin, issueAuthCookie } from "./middleware.js";

describe("Auth middleware", function () {
  let app;

  before(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.get("/protected", requireAuth, (req, res) => {
      res.status(200).json({ message: "OK", user: req.user });
    });

    app.get("/admin", requireAdmin, (req, res) => {
      res.status(200).json({ message: "ADMIN_OK", user: req.user });
    });

    app.post("/login-mock", (req, res) => {
      const user = {
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "customer",
        membership: { tier: "small", status: "active" },
      };

      const token = issueAuthCookie(res, user);
      res.status(200).json({ ok: true, token });
    });

    app.get("/cookie-protected", requireAuth, (req, res) => {
      res.status(200).json({ message: "COOKIE_OK", user: req.user });
    });
  });

  describe("requireAuth", () => {
    it("401 when missing token", async () => {
      const res = await request(app).get("/protected").expect(401);
      expect(res.body).to.have.property("message", "Missing auth token");
    });

    it("401 when token is invalid", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer hello.invalid.token")
        .expect(401);

      expect(res.body).to.have.property("message", "Invalid or expired token");
    });

    it("200 and sets req.user when Bearer token is valid", async () => {
      const payload = { sub: "123", email: "a@b.com", role: "customer" };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).to.have.property("message", "OK");
      expect(res.body.user).to.include({
        sub: "123",
        email: "a@b.com",
        role: "customer",
      });
    });

    it("200 and sets req.user when token comes from cookie", async () => {
      const loginRes = await request(app).post("/login-mock").expect(200);

      const setCookie = loginRes.headers["set-cookie"];
      expect(setCookie, "Expected set-cookie header").to.exist;

      const res = await request(app)
        .get("/cookie-protected")
        .set("Cookie", setCookie)
        .expect(200);

      expect(res.body).to.have.property("message", "COOKIE_OK");
      expect(res.body.user).to.include({
        email: "test@example.com",
        role: "customer",
      });
      expect(res.body.user).to.have.nested.property("membership.tier", "small");
      expect(res.body.user).to.have.nested.property("membership.status", "active");
    });

    it("prefers Bearer over cookie when both are present", async () => {
      const loginRes = await request(app).post("/login-mock").expect(200);
      const setCookie = loginRes.headers["set-cookie"];

      const bearerPayload = { sub: "999", email: "admin@x.com", role: "admin" };
      const bearer = jwt.sign(bearerPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

      const res = await request(app)
        .get("/protected")
        .set("Cookie", setCookie)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);

      expect(res.body.user).to.include({
        sub: "999",
        email: "admin@x.com",
        role: "admin",
      });
    });
  });

  describe("requireAdmin", () => {
    it("401 when missing token", async () => {
      const res = await request(app).get("/admin").expect(401);
      expect(res.body).to.have.property("message", "Missing auth token");
    });

    it("401 when token invalid/expired", async () => {
      const res = await request(app)
        .get("/admin")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(res.body).to.have.property("message", "Invalid or expired token");
    });

    it("403 when role is not admin", async () => {
      const token = jwt.sign(
        { sub: "123", email: "user@x.com", role: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/admin")
        .set("Authorization", `Bearer ${token}`)
        .expect(403);

      expect(res.body).to.deep.equal({ error: "Forbidden: admin access required" });
    });

    it("200 when role is admin", async () => {
      const token = jwt.sign(
        { sub: "1", email: "admin@x.com", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/admin")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).to.have.property("message", "ADMIN_OK");
      expect(res.body.user).to.include({ role: "admin" });
    });
  });

  describe("issueAuthCookie", () => {
    it("sets a httpOnly cookie named token and returns a jwt", async () => {
      const res = await request(app).post("/login-mock").expect(200);

      expect(res.body).to.have.property("token").that.is.a("string");

      const setCookie = res.headers["set-cookie"];
      expect(setCookie, "Expected set-cookie header").to.exist;

      const cookieStr = setCookie.join("; ");
      expect(cookieStr).to.include("token=");
      expect(cookieStr).to.match(/HttpOnly/i);
      expect(cookieStr).to.match(/SameSite=Lax/i);

      const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(payload).to.include({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "customer",
      });
      expect(payload).to.have.nested.property("membership.tier", "small");
      expect(payload).to.have.nested.property("membership.status", "active");
      expect(payload).to.have.property("sub");
    });
  });
});