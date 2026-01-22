import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieParser from "cookie-parser";

import router, { __testables, __setGoogleClientForTests } from "./routes.js";
import User from "../users/model.js";

let mongoServer;
let app;

const basePath = "/auth";

const details = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "user",
};

describe("Auth routes", function () {
  // mongodb-memory-server can be a bit slow on first startup
  this.timeout(20000);

  before(async () => {
    // Start in-memory Mongo
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await User.syncIndexes();
    process.env.JWT_SECRET = "test-secret";
    // Minimal express app mounting only the v1 users router
    app = express();
    app.use(express.json());
    app.use(basePath, router);
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

  it("POST /auth/register creates a user and strips sensitive fields", async () => {
    const res = await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    expect(res.body).to.include({
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
    });

    expect(res.body).to.have.property("_id");
    expect(res.body).to.not.have.property("password");
    expect(res.body).to.not.have.property("salt");
  });

  it("POST /auth/register returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post(`${basePath}/register`)
      .send({
        email: "missing-fields@example.com",
        // missing firstName, lastName, password
      })
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "firstName, lastName, email and password are required",
    );
  });

  it("POST /auth/login authenticates a registered user and returns token", async () => {
    // Register first
    await request(app).post(`${basePath}/register`).send(details).expect(201);

    // Then login
    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(200);

    expect(res.body).to.have.property("user");
    expect(res.body.user).to.include({
      email: details.email,
      firstName: details.firstName,
    });

    // Should not expose sensitive fields
    expect(res.body.user).to.not.have.property("password");
    expect(res.body.user).to.not.have.property("salt");

    // Token is placeholder for now, but should exist
    expect(res.body).to.have.property("token");
  });

  it("POST /auth/login returns 401 for wrong password", async () => {
    // Register a user
    await request(app).post(`${basePath}/register`).send(details).expect(201);

    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: "wrong-password",
      })
      .expect(401);

    // Your User.authenticate throws AuthenticationError('Invalid password')
    expect(res.body).to.have.property("message", "Invalid password");
  });

  it("POST /auth/login returns 401 for unknown email", async () => {
    const email = "no-such-user@example.com";

    const res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email,
        password: "whatever",
      })
      .expect(401);

    expect(res.body).to.have.property("message", `No such email: ${email}`);
  });

  it("PUT /auth/change-password updates the password and allows login with the new one", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const loginRes = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(200);

    expect(loginRes.body).to.have.property("token");
    const token = loginRes.body.token;

    const newPassword = "new-secret-password";

    const changeRes = await request(app)
      .put(`${basePath}/change-password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: details.password,
        newPassword,
      })
      .expect(200);

    expect(changeRes.body).to.have.property(
      "message",
      "Password updated successfully",
    );

    await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(401);

    const loginResAfter = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: newPassword,
      })
      .expect(200);

    expect(loginResAfter.body).to.have.property("user");
    expect(loginResAfter.body.user).to.include({
      email: details.email,
      firstName: details.firstName,
    });

    expect(loginResAfter.body.user).to.not.have.property("password");
    expect(loginResAfter.body.user).to.not.have.property("salt");
  });

  it("PUT /auth/change-password returns 400 when required fields are missing", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const loginRes = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(200);

    const token = loginRes.body.token;

    const res = await request(app)
      .put(`${basePath}/change-password`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "oldPassword and newPassword are required",
    );
  });

  it("PUT /auth/change-password returns 401 for wrong oldPassword", async () => {
    await request(app)
      .post(`${basePath}/register`)
      .send(details)
      .expect(201);

    const loginRes = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: details.email,
        password: details.password,
      })
      .expect(200);

    const token = loginRes.body.token;

    const res = await request(app)
      .put(`${basePath}/change-password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "totally-wrong",
        newPassword: "new-secret",
      })
      .expect(401);

    expect(res.body).to.have.property("message", "Invalid password");
  });

  it("POST /auth/login return 400 when email or password is missing", async () => {
    let res = await request(app)
      .post(`${basePath}/login`)
      .send({
        password: "whatever",
      })
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "email and password are required"
    );

    res = await request(app)
      .post(`${basePath}/login`)
      .send({
        email: "test@test.test",
      })
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "email and password are required"
    );

    res = await request(app)
      .post(`${basePath}/login`)
      .send({})
      .expect(400);

    expect(res.body).to.have.property(
      "message",
      "email and password are required"
    );
  });
});

describe("OAuth routes", function () {
  this.timeout(20000);

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.syncIndexes();

    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(basePath, router);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  describe("Helper functions", () => {
    it("pickClient returns 'app' when req.query.to === 'app', otherwise 'webb'", () => {
      const reqApp = { query: { to: "app" } };
      const reqWebb = { query: { } };
      expect(__testables.pickClient(reqApp)).to.equal("app");
      expect(__testables.pickClient(reqWebb)).to.equal("webb");
      expect(__testables.pickClient({ query: { to: "webb" } })).to.equal("webb");
    });

    it("makeState + parseState roundtrip and parseState returns null on invalid JSON", () => {
      const s = __testables.makeState("csrf123", "app");
      const parsed = __testables.parseState(s);
      expect(parsed).to.deep.equal({ csrf: "csrf123", client: "app" });

      expect(__testables.parseState("not-json")).to.equal(null);
    });

    it("signJwtFromUser creates a JWT with sub/email/role", () => {
      const token = __testables.signJwtFromUser({
        _id: "abc123",
        email: "a@b.com",
        role: "customer",
      });

      expect(token).to.be.a("string");
      expect(token.split(".")).to.have.length(3);
    });
  });

  describe("Google OAuth routes", () => {
    it("GET /auth/google sets oauth cookies and redirects", async () => {
      __setGoogleClientForTests({
        authorizationUrl: ({ state, code_challenge }) => {
          return `https://example.com/auth?state=${encodeURIComponent(state)}&cc=${encodeURIComponent(code_challenge)}`;
        },
      });

      const res = await request(app)
        .get(`${basePath}/google?to=app`)
        .expect(302);

      expect(res.headers.location).to.match(/^https:\/\/example\.com\/auth\?/);

      const setCookie = res.headers["set-cookie"] || [];
      expect(setCookie.join(";")).to.include("oauth_state=");
      expect(setCookie.join(";")).to.include("oauth_code_verifier=");
    });

    it("GET /auth/google/callback returns 400 if code/state missing", async () => {
      __setGoogleClientForTests({ callback: async () => ({ claims: () => ({}) }) });

      await request(app)
        .get(`${basePath}/google/callback`)
        .expect(400);
    });

    it("GET /auth/google/callback returns 401 if saved state missing", async () => {
      __setGoogleClientForTests({ callback: async () => ({ claims: () => ({}) }) });

      await request(app)
        .get(`${basePath}/google/callback?code=123&state=abc`)
        .expect(401)
        .then((res) => {
          expect(res.body.message).to.equal("Missing saved state");
        });
    });

    it("GET /auth/google/callback returns 401 if state mismatch", async () => {
      __setGoogleClientForTests({ callback: async () => ({ claims: () => ({}) }) });

      await request(app)
        .get(`${basePath}/google/callback?code=123&state=abc`)
        .set("Cookie", [`oauth_state=DIFFERENT`, `oauth_code_verifier=verifier123`])
        .expect(401)
        .then((res) => {
          expect(res.body.message).to.equal("Invalid state");
        });
    });

    it("GET /auth/google/callback success creates user, sets token cookie, redirects to app customer url", async () => {
      const state = __testables.makeState("csrf1", "app");

      __setGoogleClientForTests({
        callback: async () => ({
          claims: () => ({
            sub: "google-sub-1",
            email: "google@example.com",
            given_name: "Gina",
            family_name: "Google",
          }),
        }),
      });

      const res = await request(app)
        .get(`${basePath}/google/callback?code=CODE123&state=${encodeURIComponent(state)}`)
        .set("Cookie", [
          `oauth_state=${encodeURIComponent(state)}`,
          `oauth_code_verifier=verifier123`,
        ])
        .expect(302);

      expect(res.headers.location).to.equal(__testables.CLIENT_REDIRECTS.app.customer);

      const setCookie = res.headers["set-cookie"] || [];
      expect(setCookie.join(";")).to.include("token=");
      expect(setCookie.join(";")).to.include("HttpOnly");

      const created = await User.findOne({ email: "google@example.com" });
      expect(created).to.exist;
      expect(created.oauthProvider).to.equal("google");
      expect(created.oauthSubject).to.equal("google-sub-1");
      expect(created.firstName).to.equal("Gina");
      expect(created.lastName).to.equal("Google");
    });
  });

  describe("GitHub OAuth routes", () => {
    const originalFetch = global.fetch;

    before(() => {
      process.env.GITHUB_CLIENT_ID = "gh-client";
      process.env.GITHUB_CLIENT_SECRET = "gh-secret";
      process.env.GITHUB_REDIRECT_URI = "http://localhost:3000/auth/github/callback";
    });

    after(() => {
      global.fetch = originalFetch;
    });

    it("GET /auth/github sets oauth_state cookie and redirects to github authorize", async () => {
      const res = await request(app)
        .get(`${basePath}/github?to=webb`)
        .expect(302);

      expect(res.headers.location).to.match(/^https:\/\/github\.com\/login\/oauth\/authorize\?/);

      const setCookie = res.headers["set-cookie"] || [];
      expect(setCookie.join(";")).to.include("oauth_state=");
    });

    it("GET /auth/github/callback returns 400 if code/state missing", async () => {
      await request(app)
        .get(`${basePath}/github/callback`)
        .expect(400);
    });

    it("GET /auth/github/callback success creates user, sets token cookie, redirects to webb/customer url", async () => {
      const state = __testables.makeState("csrf2", "webb");

      global.fetch = async (url, options) => {
        if (url === "https://github.com/login/oauth/access_token") {
          return {
            json: async () => ({ access_token: "gh-access-token" }),
          };
        }

        if (url === "https://api.github.com/user") {
          return {
            json: async () => ({ id: 999, name: "Octo Cat" }),
          };
        }

        if (url === "https://api.github.com/user/emails") {
          return {
            json: async () => ([
              { email: "octo@example.com", primary: true, verified: true },
            ]),
          };
        }

        throw new Error(`Unexpected fetch URL: ${url}`);
      };

      const res = await request(app)
        .get(`${basePath}/github/callback?code=CODE999&state=${encodeURIComponent(state)}`)
        .set("Cookie", [`oauth_state=${encodeURIComponent(state)}`])
        .expect(302);

      expect(res.headers.location).to.equal(__testables.CLIENT_REDIRECTS.webb.customer);

      const setCookie = res.headers["set-cookie"] || [];
      expect(setCookie.join(";")).to.include("token=");
      expect(setCookie.join(";")).to.include("HttpOnly");

      const created = await User.findOne({ email: "octo@example.com" });
      expect(created).to.exist;
      expect(created.oauthProvider).to.equal("github");
      expect(created.oauthSubject).to.equal("999");
      expect(created.firstName).to.equal("Octo");
      expect(created.lastName).to.equal("Cat");
    });
  });
});