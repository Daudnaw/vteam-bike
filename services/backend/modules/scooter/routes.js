import { Router } from "express";
import { model } from "mongoose";
import { requireAuth } from "../auth/middleware.js";
const Scooter = model("Scooter");

export const v1 = Router();

/**
 * @route GET /scooters/:id
 * @summary Get a scooter
 * @description This endpoint gets a scooter
 * @param {string} id.path.required - id of scooter
 * @produces application/json
 * @consumes application/json
 * @returns {scooter.model} 200 - scooter found
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const scooter = await Scooter.findById(id);

    res.status(200).send(scooter.toJSON());
  } catch (err) {
    return next(err);
  }
});

/**
 * TODO - fundera på om denna route ska vara kvar eller ej
 * @route GET v1/scooters/
 * @summary Get all scooters
 * @description This endpoint gets all the scooters
 * @produces application/json
 * @consumes application/json
 * @returns {scooter.model} 200 - scooters found
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Not found
 */
v1.get("/", async (req, res, next) => {
  try {
    const scooters = await Scooter.find({});

    res.status(200).send(scooters);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /v1/scooters
 * @summary Create a scooter
 * @description Creates a new scooter (admin only)
 * @produces application/json
 * @consumes application/json
 * @returns {Scooter.model} 201 - Scooter created
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 400 - Validation error
 */
v1.post("/", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admins only" });
    }

    const {
      battery,
      lat,
      lon,
      status,
    } = req.body;

    const scooter = await Scooter.create({
      battery: battery,
      lat: lat,
      lon: lon,
      status: status,
    });

    return res.status(201).json(scooter.toJSON());
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /v1/scooters/:id
 * @summary Update the scooters's info
 * @description Updates the scooters's info based on the id
 * @produces application/json
 * @consumes application/json
 * @returns {User.model} 200 - Scooter updated
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 */
v1.put("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }

  const updatedscooter = await Scooter.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedscooter) {
    return res.status(404).json({ error: "scooter not found" });
  }

  res.json(updatedscooter);
});

/**
 * @route DELETE /v1/scooters/:id
 * @summary Delete a scooter
 * @description Deletes a scooter.
 * @produces application/json
 * @consumes application/json
 * @returns {scooter.model} 200 - scooter deleted
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 */
v1.delete("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admins only" });
    }

    const deletedscooter = await Scooter.findByIdAndDelete(id);

    if (!deletedscooter) {
      return res.status(404).json({ error: "scooter not found" });
    }

    return res.status(200).json(deletedscooter.toJSON());
  } catch (err) {
    next(err);
  }
});
