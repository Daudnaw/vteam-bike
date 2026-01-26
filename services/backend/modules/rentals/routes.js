import { Router } from "express";
import { model } from "mongoose";
import { sendCommand } from "../scooter/ws";
import { requireAuth } from "../auth/middleware.js";
import User from "../users/model.js";

const Rental = model("Rental");
//const Location = model("Location");

export const v1 = Router();

/**
 * @route GET /v1/rentals
 * @summary Get all rentals
 * @description Returns json with all rentals
 * @returns {Array<Rental.model>} 200 List of rentals
 */
v1.get("/", requireAuth, async (req, res, next) => {
  try {
    const rentals = await Rental.find()
      .populate("user", "firstName email") //vad mer vill vi ha
      .populate("scooter", "name status"); //vad mer vill vi ha
    res.status(200).json(rentals);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /v1/rentals/:id
 * @summary Get rental by rental-id
 * @description get a specific Rental
 * @param {string} id.path.required Rental document ID
 * @returns {Rental.model} 200 Rental document
 * @returns {Error} 404 Not found
 */
v1.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("user", "firstName email")
      .populate("scooter", "name status");

    if (!rental) return res.status(404).json({ error: "Rental not found" });

    res.status(200).json(rental);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /v1/rentals
 * @summary Create a new rental
 * @description This creates a new rental by taking user and scooter
 * @body {string} user.required User ID
 * @body {string} scooter.required Scooter ID
 * @returns {Rental.model} 200 Created rental
 * @returns {Error} 400 - Invalid input
 */
v1.post("/", requireAuth, async (req, res, next) => {
  try {
    const { user, scooter } = req.body;

    if (!user || !scooter) {
      return res.status(400).json({ error: "User and Scooter are required" });
    }

    const existed = sendCommand(scooter, { action: "START"});

    if (!existed) {
      return res.status(409).json({ error: "Scoter is offline", rental});
    }

    const rental = new Rental({ user, scooter });
    await rental.startRental();

    res.status(200).json(rental);
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /v1/rentals/:id/end
 * @summary End a rental
 * @description Ends the rental and saves journy history into rental and the cost
 * @param {string} id.path.required - Rental ID
 * @returns {Rental.model} 200 - Updated rental with endTime, cost, tripHistory
 * @returns {Error} 404 - Not found
 */
v1.patch("/:id/end", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.user) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const existed = sendCommand(rental.scooter, { action: "STOP"});

    if (!existed) {
      return res.status(409).json({ error: "Scoter is offline", rental});
    }

    const paymentMethod = req.body.paymentMethod;
    const allowed = ["credit", "stripe"];
    if (!allowed.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const updatedRental = await rental.endRental();
    const { cost } = await handelPrice(updatedRental);

    // TODO: lösa med betalning både coins och med kort

    if (paymentMethod === "credit") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (user.credit < cost) {
        return res.status(402).json({ error: "Too little credits" });
      }

      user.credit -= cost;
      await user.save();
    } else {
      // TODO fixa med stipe betalning för resan
      const r = await fetch("http://localhost:3000/v1/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cost, currency: "sek", rentalId: rental._id, userId }),
    });

    const body = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "Stripe failed", body });

    return res.status(200).json({ cost, stripe: body });
    }

    updatedRental.cost = cost;
    await updatedRental.save();
    res.status(200).json(updatedRental);
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /v1/rentals/:id
 * @summary Delete a rental
 * @description delete a rental and returns messag if success
 * @param {string} id.path.required Rental ID
 * @returns {object} 200 - { message: "Rental deleted" }
 * @returns {Error} 404 - Not found
 */
v1.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    res.status(200).json({ message: "Rental deleted" });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /v1/rentals/:id/duration
 * @summary Get duration of rental in minutes
 * @description returns the duration for the journey in minutes
 * @param {string} id.path.required - Rental ID
 * @returns {object} 200 - { durationMinutes: number|null }
 * @returns {Error} 404 - Not found
 */
v1.get("/:id/duration", requireAuth, async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    res.status(200).json({ durationMinutes: rental.durationMinutes });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /v1/rentals/user/:userId
 * @summary Get all rentals for a specific user
 * @description Returns all rentals for a specific user
 * @param {string} userId.path.required User ID
 * @returns {Array<Rental.model>} 200 - List of rentals for the user
 * @returns {Error} 404 If no rentals found
 */
v1.get("/user/:userId", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const rentals = await Rental.find({ user: userId })
      .populate("user", "firstName email")
      .populate("scooter", "name status");

    if (rentals.length === 0) {
      return res.status(404).json({ message: "No rentals found for this user" });
    }

    res.status(200).json(rentals);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /v1/rentals/user/:userId/latest
 * @summary Get the most recent rental for a user
 * @description Gives you the latest rental fot a user
 * @param {string} userId.path.required - ID of the user
 * @returns {Rental.model} 200 Most recent rental
 * @returns {Error} 404 - If user has no rentals
 */
v1.get("/user/:userId/latest", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rental = await Rental.findOne({ user: userId })
      .sort({ startTime: -1 })
      .populate("user", "firstName email")
      .populate("scooter", "name status");

    if (!rental) {
      return res.status(404).json({ message: "No rentals found for this user" });
    }

    res.status(200).json(rental);
  } catch (err) {
    next(err);
  }
});

//en för aktiv resa också??
