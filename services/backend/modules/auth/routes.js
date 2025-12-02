import { Router } from "express";
import createDebug from "debug";
import User from "../users/model.js";
import { AuthenticationError } from "../../lib/authentication-error.js";

const debug = createDebug("backend:auth");
const router = Router();

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

    debug("Registered user %s", created.email);

    // TODO: decide if we want to issue a token on registration already
    res.status(201).json();
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

    // TODO: Issue a JWT here properly
    res.json({
      user: sanitized,
      token: "TODO_JWT", // placeholder
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ message: err.message });
    }

    debug("Error in /login: %O", err);
    next(err);
  }
});

export default router;
