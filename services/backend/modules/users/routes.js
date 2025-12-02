import { Router } from "express";
import { model } from "mongoose";
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
