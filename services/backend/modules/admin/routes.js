import { Router } from "express";
import createDebug from "debug";
import User from "../users/model.js";
import { requireAdmin } from "../auth/middleware.js";

const debug = createDebug("backend:auth");
const router = Router();

/**
 * @route PUT /users/:id
 * @summary Admin: update a user excluding password fields
 * @description Updates allowed fields for a user. Password and salt cannot be updated here.
 * @param {string} id.path.required - User ID
 * @consumes application/json
 * @produces application/json
 * @returns {object} 200 - Updated user
 * @returns {Error} 400 - Invalid payload
 * @returns {Error} 403 - Forbidden fields included
 * @returns {Error} 404 - User not found
 */
router.put("/:id", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  const data = req.body ?? {};

  const forbidden = ["password", "salt"];
  for (const field of forbidden) {
    if (field in data) {
      return res.status(403).json({
        error: "Forbidden: password or salt cannot be updated via this endpoint",
      });
    }
  }

  const allowed = ["firstName", "lastName", "email", "role"];
  const update = Object.fromEntries(
    Object.entries(data).filter(([key]) => allowed.includes(key))
  );

  try {
    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser.toJSON());
  } catch (err) {
    debug("Failed to update user: %O", err);
    next(err);
  }
});

export default router;
