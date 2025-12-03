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
 * @route PUT v1/users/:id
 * @summary Update a users info - not password
 * @description This endpoint update a user
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - User updated
 * @returns {Error} 400 - Forbidden update
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const forbidden = ["password", "salt", "role"];

  for (const field of forbidden) {
    if (field in data) {
      return res.status(400).json({ error: "Could not updated via this endpoint" });
    }
  }

  try {
    await User.findByIdAndUpdate(id, data);

    res.status(200).json();
  } catch (err) {
    next(err);
  }
})

/**
 * @route DELETE v1/users/:id
 * @summary Deleta a user
 * @description This endpoint delete a user
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - User deleted
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);

    res.status(200).json();
  } catch (err) {
    next(err);
  }
})