import { Schema, model } from "mongoose";

/**
 * Scooter status values used by the backend.
 *
 * Keep these aligned with:
 * - WS server code (offline on disconnect)
 * - scooter-logic device code (idle/driving)
 */
export const STATUSES = Object.freeze({
  IDLE: "idle",
  DRIVING: "driving",
  OFFLINE: "offline",
});

/**
 * Allowed scooter status values persisted in MongoDB.
 *
 * @typedef {"idle" | "driving" | "offline"} ScooterStatus
 */

/**
 * @typedef {object} Scooter
 * @property {number} battery Battery percentage (0..100).
 * @property {number} lat Latitude in decimal degrees (-90..90).
 * @property {number} lon Longitude in decimal degrees (-180..180).
 * @property {number} speedKmh Speed in km/h (>= 0).
 * @property {ScooterStatus} status Operational status.
 * @property {Date|null} lastSeenAt Last time a WS update/connection event was observed.
 * @property {Date} createdAt Mongoose timestamp.
 * @property {Date} updatedAt Mongoose timestamp.
 */

const schema = new Schema(
  {
    battery: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    lat: {
      type: Number,
      min: -90,
      max: 90,
      default: 0,
    },
    lon: {
      type: Number,
      min: -180,
      max: 180,
      default: 0,
    },
    speedKmh: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.OFFLINE,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

/**
 * Transform the object to JSON
 * Removes internal fields before sending to client
 *
 * @param {Object} schema - The schema of the model
 * @param {Object} ret - The object to be returned
 *
 * @return {Object} - The transformed object
 */
schema.options.toJSON = {
  transform: (_, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
};

/**
 * Keep speed consistent with status.
 * If the scooter is idle/offline, we never store a non-zero speed.
 */
schema.pre("save", function normalizeInvariants() {
  if (this.status !== STATUSES.DRIVING) {
    this.speedKmh = 0;
  }
});

schema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function normalizeUpdate(next) {
    const update = this.getUpdate() ?? {};
    const $set = update.$set ?? update;

    // If status is being set to anything other than driving, force speed to 0.
    if ($set.status && $set.status !== STATUSES.DRIVING) {
      if (update.$set) update.$set.speedKmh = 0;
      else update.speedKmh = 0;
    }

    next();
  },
);

const Scooter = model("Scooter", schema);
export default Scooter;
