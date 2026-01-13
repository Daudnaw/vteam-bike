import { Router } from "express";
import { model } from "mongoose";
import { requireAuth } from "../auth/middleware.js";
const User = model("User");

export const v1 = Router();

/**
 * @route GET /users/:id
 * @summary Get a user
 * @description This endpoint gets a user
 * @param {string} id.path.required - id of user
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - User found
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    res.status(200).send(user.toJSON());
  } catch (err) {
    return next(err);
  }
});

/**
 * TODO - fundera på om denna route ska vara kvar eller ej
 * @route GET v1/users/
 * @summary Get all users
 * @description This endpoint gets all the users
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - Users found
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.get("/", async (req, res, next) => {
  try {
    const users = await User.find({});

    res.status(200).send(users);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route PUT /v1/users/:id
 * @summary Update the authenticated user's info - not password
 * @description Updates the authenticated user's info based on the user-id (sub) from the JWT
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - User updated
 * @returns {Error} 400 - Invalid payload
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 403 - Forbidden update
 * @returns {Error} 404 - Not found
 */
v1.put("/me", requireAuth, async (req, res, next) => {
  const data = req.body;
  const forbidden = ["password", "salt", "role"];

  for (const field of forbidden) {
    if (field in data) {
      return res
        .status(403)
        .json({ error: "Forbidden: password, salt or role cannot be updated via this endpoint" });
    }
  }

  try {
    const authenticatedUserId = req.user.sub;

    const updatedUser = await User.findByIdAndUpdate(authenticatedUserId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser.toJSON());
  } catch (err) {
    next(err);
  }
});

v1.put("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }

  const forbidden = ['password', 'salt'];
  for (const f of forbidden) {
    if (f in req.body) {
      return res.status(403).json({ error: 'Forbidden field' });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedUser);
});

/**
 * @route DELETE /v1/users/:id
 * @summary Delete a user
 * @description Deletes a user. A normal user may only delete themselves; admins may delete any user.
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - User deleted
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 */
v1.delete("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const authenticatedUserId = req.user.sub;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && id !== authenticatedUserId) {
      return res
        .status(403)
        .json({ error: "Forbidden: cannot delete other users" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(deletedUser.toJSON());
  } catch (err) {
    next(err);
  }
});