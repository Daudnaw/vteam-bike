import { Router } from "express";
import createDebug from "debug";
import User from "../users/model.js";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../../lib/authentication-error.js";
import { requireAuth } from "./middleware.js";
import { Issuer, generators } from "openid-client";

const debug = createDebug("backend:auth");
const router = Router();
let googleClientPromise = null;

function getGoogleClient() {
  if (!googleClientPromise) {
    googleClientPromise = (async () => {
      const issuer = await Issuer.discover("https://accounts.google.com");
      return new issuer.Client({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
        response_types: ["code"],
      });
    })();
  }
  return googleClientPromise;
}

function signJwtFromUser(sanitized) {
  const payload = {
    sub: sanitized._id,
    email: sanitized.email,
    role: sanitized.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

router.get("/google", async (req, res, next) => {
  try {
    const client = await getGoogleClient();

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();

    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    });

    res.cookie("oauth_code_verifier", code_verifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    });

    const url = client.authorizationUrl({
      scope: "openid email profile",
      state,
      code_challenge,
      code_challenge_method: "S256",
    });

    return res.redirect(url);
  } catch (err) {
    next(err);
  }
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const client = await getGoogleClient();

    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;
    const code_verifier = req.cookies.oauth_code_verifier;

    if (!code || !state) return res.status(400).json({ message: "Missing code/state" });
    if (!savedState || state !== savedState) return res.status(401).json({ message: "Invalid state" });
    if (!code_verifier) return res.status(400).json({ message: "Missing code_verifier" });

    const tokenSet = await client.callback(
      process.env.GOOGLE_REDIRECT_URI,
      { code, state },
      { code_verifier, state }
    );

    const claims = tokenSet.claims();

    if (!claims?.sub) return res.status(400).json({ message: "Missing sub from Google" });
    if (!claims?.email) return res.status(400).json({ message: "Missing email from Google" });

    let user = await User.findOne({ oauthProvider: "google", oauthSubject: claims.sub });

    if (!user && claims.email) {
      const byEmail = await User.findOne({ email: claims.email });
      if (byEmail) {
        byEmail.oauthProvider = "google";
        byEmail.oauthSubject = claims.sub;
        user = await byEmail.save();
      }
    }

    if (!user) {
      user = await User.create({
        firstName: claims.given_name ?? "Google",
        lastName: claims.family_name ?? "User",
        email: claims.email,
        oauthProvider: "google",
        oauthSubject: claims.sub,
      });
    }

    res.clearCookie("oauth_state");
    res.clearCookie("oauth_code_verifier");

    const sanitized = user.toJSON();
    const token = signJwtFromUser(sanitized);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect("http://localhost:8080/user-dashboard");
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /auth/register
 * @summary Register a new user
 * @description Creates a new user account
 * @param {string} firstName.body.required - First name
 * @param {string} lastName.body.required - Last name
 * @param {string} email.body.required - Email address
 * @param {string} password.body.required - Plain text password
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 201 - User registered
 * @returns {Error} 400 - Missing or invalid fields
 */
router.post("/register", async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "firstName, lastName, email and password are required",
    });
  }

  try {
    const user = new User({ firstName, lastName, email, password });

    const created = await user.save();

    const sanitized = created.toJSON();

    debug("Registered user %s", sanitized.email);

    // TODO: decide if we want to issue a token on registration already
    res.status(201).json(sanitized);
  } catch (err) {
    debug("Error in /register: %O", err);
    return next(err);
  }
});

/**
 * @route POST /auth/login
 * @summary Log in a user
 * @description Authenticates a user and returns a token
 * @param {string} email.body.required - Email address
 * @param {string} password.body.required - Plain text password
 * @produces application/json
 * @consumes application/json
 * @returns {AuthResponse.model} 200 - Authenticated user and token
 * @returns {Error} 400 - Missing credentials
 * @returns {Error} 401 - Invalid credentials
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.authenticate(email, password);

    const sanitized = user.toJSON();

    debug("User %s logged in", sanitized.email);

    const payload = {
      sub: sanitized._id,
      email: sanitized.email,
      role: sanitized.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      user: sanitized,
      token: token,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ message: err.message });
    }

    debug("Error in /login: %O", err);
    next(err);
  }
});

/**
 * @route PUT /auth/change-password
 * @summary Change the authenticated user's password
 * @description Uses the user-id (sub) from the JWT to identify the user and update the password
 * @param {string} oldPassword.body.required - Current password
 * @param {string} newPassword.body.required - New password
 * @produces application/json
 * @consumes application/json
 * @returns {AuthResponse.model} 200 - Password updated
 * @returns {Error} 400 - Missing credentials
 * @returns {Error} 401 - Invalid credentials
 */
router.put("/change-password", requireAuth, async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "oldPassword and newPassword are required",
    });
  }

  try {
    const userId = req.user.sub;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await user.verifyPassword(oldPassword);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    user.password = newPassword;
    await user.save();

    const sanitized = user.toJSON();
    
    debug("user %s changed password", sanitized.email);

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    debug("Error in /change-password: %O", err);
    next(err);
  }
});



export default router;
