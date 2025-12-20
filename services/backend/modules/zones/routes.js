import { Router } from "express";
import { model } from "mongoose";
import createDebug from "debug";
import { requireAuth, requireAdmin } from "../auth/middleware.js";
const Zone = model("Zone");

const debug = createDebug("backend:auth");
export const v1 = Router();

/**
 * GET /zones
 * 
 * Retrieves all zones from the database.
 * 
 * Access: Admin only (protected by requireAuth and requireAdmin).
 *
 * @route GET /zones
 * @group Zones - Endpoints for managing zones
 * @returns {Array<Zone>} 200 - List of all zones
 * @returns {Error} 403 - Forbidden if the user is not an admin
 */
v1.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const zones = await Zone.find();
    res.status(200).json(zones);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /zones/:zoneType
 *
 * Retrieves all zones matching the specified zone type.
 *
 * Access: Admin only (protected by requireAuth and requireAdmin).
 *
 * @route GET /zones/{zoneType}
 * @param {string} zoneType.path.required - The zone type to filter by
 * @group Zones - Endpoints for managing zones
 * @returns {Array<Zone>} 200 - List of zones matching the type
 * @returns {Error} 400 - Invalid zone type
 * @returns {Error} 403 - Forbidden (not an admin)
 */
v1.get("/zonetype/:zoneType", requireAuth, requireAdmin, async (req, res, next) => {
  const { zoneType } = req.params;

  const allowed = ["parking", "speed_limit", "no_go", "city", "charge_station", "custom"];

  if (!allowed.includes(zoneType)) {
    return res.status(400).json({ error: "Invalid zone type" });
  }

  try {
    const zones = await Zone.findByZoneType(zoneType);
    res.status(200).json(zones);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /zones/:id
 *
 * Retrieves a single zone by its ID.
 *
 * Requires authentication and admin privileges.
 *
 * @route GET /zones/{id}
 * @group Zones - Endpoints for managing zones
 * @param {string} id.path.required - Zone ID
 * @returns {Zone.model} 200 - The requested zone
 * @returns {Error} 404 - Zone not found
 * @returns {Error} 403 - Forbidden (not an admin)
 */
v1.get("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    const zone = await Zone.findById(id);

    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    return res.status(200).json(zone.toJSON());
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /zones
 *
 * Creates a new zone.
 *
 * Requires authentication and admin privileges.
 *
 * @route POST /zones
 * @group Zones - Endpoints for managing zones
 * @returns {Zone.model} 201 - The created zone
 * @returns {Error} 400 - Missing required fields (name, type, zoneType)
 * @returns {Error} 403 - Forbidden (not admin)
 */
v1.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  const { name, type, zoneType } = req.body;
  
  if (!name || !type || !zoneType) {
    return res.status(400).json({
      message: "name, type and zoneType are required",
    });
  }

  try {
    const zone = new Zone(req.body);

    const created = await zone.save();
    const sanitized = created.toJSON();

    debug("Zone created %s", sanitized.name);

    res.status(201).json(sanitized);
  } catch(err) {
    debug("Error in post /zone: %0", err);
    return next(err);
  }
});

/**
 * PUT /zones/:id
 *
 * Updates an existing zone using findById → set → save.
 * This ensures that pre("save") validation and transformations are applied.
 *
 * Requires admin privileges.
 *
 * @route PUT /zones/{id}
 * @group Zones
 * @returns {Zone.model} 200 - Updated zone
 * @returns {Error} 403 - Not authorized
 * @returns {Error} 404 - Zone not found
 */
v1.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }
    
    zone.set(updates);

    const updated = await zone.save();

    return res.status(200).json(updated.toJSON());
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /zones/:id
 *
 * Deletes a zone by its ID.
 *
 * Requires authentication and admin privileges.
 *
 * @route DELETE /zones/{id}
 * @group Zones - Endpoints for managing zones
 * @param {string} id.path.required - Zone ID
 * @returns {void} 204 - Zone successfully deleted
 * @returns {Error} 404 - Zone not found
 * @returns {Error} 403 - Forbidden (admin required)
 */
v1.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedZone = await Zone.findByIdAndDelete(id);

    if (!deletedZone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    return res.status(200).json(deletedZone.toJSON());
  } catch (err) {
    return next(err);
  }
});
