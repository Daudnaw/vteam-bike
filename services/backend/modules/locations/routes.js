import { Router } from "express";
import { model } from "mongoose";
//import { requireAuth } from "../auth/middleware.js";

const Location = model("Location");

export const v1 = Router();

/**
 * @route GET /v1/location/:scooterId
 * @summary Get current position of a scooter
 * @description this endpoint gets currentposition of a scooter
 * @param {string} scooterId.path.required- id of scooter
 * @returns {Position.model} 200 - Current position
 */
v1.get("/:scooterId", async (req, res, next) => {
  try {
    const { scooterId } = req.params;
    const loc = await Location.findOne({ scooterId });

    if (!loc) return res.status(404).json({ error: "Location not found" });

    // Return only the current field not whole location, needed?
    res.status(200).json(loc.current);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /v1/location/:scooterId/history
 * @summary Get full position history
 * @description Returns all historical positions of a scooter
 * @param {string} scooterId.path.required- id of scooter
 * @returns {Array} 200 - Array of positions
 * @returns {Error} 404 - Not found
 */
v1.get("/:scooterId/history", async (req, res, next) => {
  try {
    const { scooterId } = req.params;
    const loc = await Location.findOne({ scooterId });

    if (!loc) return res.status(404).json({ error: "Location not found" });

    res.status(200).json(loc.getHistory());
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /v1/location/:scooterId
 * @summary Add a new position
 * @description Adds a new position update to a scooter
 * @param {string} scooterId.path.required- id of scooter
 * @body {number} lat.required
 * @body {number} lng.required
 * @returns {Location.model} 200 - Updated location
 * @returns {Error} 400 - Invalid bodyd
 */
v1.post("/:scooterId", async (req, res, next) => {
  try {
    const { scooterId } = req.params;
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "lat and lng are to be numbers" });
    }

    let loc = await Location.findOne({ scooterId });

    if (!loc) {
      // Om location inte finnsskapa nytt dokument
      loc = new Location({
        scooterId,
        current: { lat, lng },
        history: [],
      });
      await loc.save();
    } else {
      await loc.addPosition(lat, lng);
    }

    res.status(200).json(loc.toJSON());
  } catch (err) {
    next(err);
  }
});
