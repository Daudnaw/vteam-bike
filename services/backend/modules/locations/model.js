import { Schema, model } from "mongoose";

/**
 * @typedef Position
 * @property {number} lat.required
 * @property {number} lng.required
 *
 * @typedef Location
 * @property {string} _id
 * @property {string} scooterId.required reference to a scooter
 * @property {Position} current.required latest known position
 * @property {Array<Position>} history previous positions in an array
 * @property {Function} addPosition add a new position update
 * @property {Function} getLatestPosition rturns the current position
 * @property {Function} getHistory returns all historical positions
 * @property {Function} toJSON
 */

const positionSchema = new Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

// Main schema
const schema = new Schema(
  {
    scooterId: {
      type: Schema.Types.ObjectId,
      ref: "Scooter",
      required: true,
      unique: true, //vet inte om vi ska ha??
      index: true,
    },

    current: {
      type: positionSchema,
      required: true,
    },

    history: {
      type: [positionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
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
 * Adds a new position update.
 * Moves current → history
 * Sets a new current.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<Location>}
 */
schema.methods.addPosition = async function (lat, lng) {
  if (this.current) {
    this.history.push(this.current);
  }

  this.current = {
    lat,
    lng,
  };

  return this.save();
};

/**
 * Returns the latest real-time position.
 *
 * @returns {Position}
 */
schema.methods.getLatestPosition = function () {
  return this.current;
};

/**
 * Returns full position history.
 *
 * @returns {Array<Position>}
 */
schema.methods.getHistory = function () {
  return this.history;
};

const Location = model("Location", schema);

export default Location;
