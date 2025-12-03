import { Router } from "express";
import createDebug from "debug";
import User from "../users/model.js";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../../lib/authentication-error.js";
import { requireAuth } from "./middleware.js";

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
 * TODO - göra säkrare med JWT
 * @route PUT /auth/change-password
 * @summary Change a users password
 * @description Changes the users password
 * @param {string} email.body.required - Email address
 * @param {string} oldPassword.body.required - Plain text password
 * @param {string} newPassword.body.required - Plain text password
 * @produces application/json
 * @consumes application/json
 * @returns {AuthResponse.model} 200 - Password updatetd
 * @returns {Error} 400 - Missing credentials
 * @returns {Error} 401 - Invalid credentials
 */
router.put("/change-password", requireAuth, async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "oldPassword and newPassword are required",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "New password can not be the same as the old"
    });
  }

  try {
    const email = req.user.email;
    const user = await User.authenticate(email, oldPassword);

    user.password = newPassword;
    await user.save();

    const sanitized = user.toJSON();
    debug("user %s changed password", sanitized.email);

    return res.status(200).json({
      message: "Password updated successfully",
    })
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ message: err.message });
    }

    debug("Error in /change-password: %O", err);
    next(err);
  }
});

export default router;
