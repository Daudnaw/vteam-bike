import { Schema, model } from "mongoose";

/**
 * @typedef Zone
 * @property {string} _id - Zone ID
 * @property {string} name.required - Name of the zone
 * @property {"circle"|"polygon"} type.required - Geometry type of the zone
 * @property {number[][]} [area] - Polygon area (array of [lat, lng] pairs), required if type = "polygon"
 * @property {number[]} [center] - Center coordinate [lat, lng], required if type = "circle"
 * @property {number} [radius] - Radius in meters, required if type = "circle"
 * @property {boolean} active.required - Whether the zone is active or not
 * @property {"parking"|"speed_limit"|"no_go"|"city"|"custom"} zoneType.required - Zone usage type
 * @property {number} [maxSpeed] - Max allowed speed inside the zone
 */
const zoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["circle", "polygon"],
    },
    area: {
      type: [[Number]],
      required: function () {
        return this.type === "polygon";
      },
    },
    center: {
      type: [Number],
      required: function () {
        return this.type === "circle";
      },
    },
    radius: {
      type: Number,
      required: function () {
        return this.type === "circle";
      },
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    zoneType: {
      type: String,
      required: true,
      enum: ["parking", "speed_limit", "no_go", "city", "custom"],
    },
    maxSpeed: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Transform object to be JSON
 * @param {Object} zoneSchema - The zones schema of the model
 * @param {Object} ret - The object to be returns
 * 
 * @return {Object} - The transformed object
 */
zoneSchema.options.toJSON = {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

/**
 * Validates that the zone data matches the requirements for Leaflet
 * and the internal zone logic. Ensures:
 *  - Polygon zones have at least 3 coordinates
 *  - Circle zones have a valid center and radius
 *  - Irrelevant fields are removed based on zone type
 *
 * @returns {Promise<void>}
 * @throws {Error}
 */
zoneSchema.pre("save", async function () {
  this.type = this.type.toLowerCase();

  if (this.type === "polygon") {
    this.center = undefined;
    this.radius = undefined;

    if (!this.area || this.area.length < 3) {
      throw new Error("Polygon needs at least 3 coordinates.");
    }
  }

  if (this.type === "circle") {
    this.area = undefined;

    if (!this.center || this.center.length !== 2) {
      throw new Error("Circle needs a center [lat, lng].");
    }
    if (!this.radius || this.radius <= 0) {
      throw new Error("Circle needs a positive radius.");
    }
  }
});


/**
 * Finds all active zones
 * 
 * @returns All active zones
 */
zoneSchema.statics.findActive = function () {
  return this.find({ active: true });
};

/**
 * Finds all zones of one specific zone type
 * 
 * @param {string} zoneType - The zone type to search for
 * @returns {Promise<Zone[]>} All zones in the specific zone type
 */
zoneSchema.statics.findByZoneType = function (zoneType) {
  return this.find({ zoneType });
};

/**
 * Checks if the zone is a parking zone.
 *
 * @returns {boolean} True if the zone is a parking zone
 */
zoneSchema.methods.isParkingZone = function () {
  return this.zoneType === "parking";
};

const Zone = model("Zone", zoneSchema);

export default Zone;