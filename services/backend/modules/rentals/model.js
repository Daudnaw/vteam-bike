import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import "../location/model.js";

/**
 * @typedef Rental
 * @property {Date} startTime when rental starts
 * @property {Date} endTime when the rental ends
 * @property {string} scooter.required reference to a scooter
 * @property {string} user.required reference to a user
 * @property {number} cost total cost of the rental
 * @property {number} startHistoryIndex index inside Location.history where rental begins
 * @property {Array<Position>} tripHistory slice of scooter for thsi rental
 *
 * @property {Function} startRental startTime and get the index of Location.history
 * @property {Function} getDurationMinutes Returns total duration of the rental
 * @property {Function} calculateCost calculate cost upon time
 * @property {Function} endRental sets endTime and add the the position of the rental
 * @property {Function} getLocationByScooter static method
 */

const schema = new Schema(
  {
    startTime: { type: Date },
    endTime: { type: Date },

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scooter: { type: Schema.Types.ObjectId, ref: "Scooter", required: true },

    cost: { type: Number, default: 0 },

    //för att hämta korrekt slice av history
    startHistoryIndex: { type: Number, default: 0 },

    tripHistory: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
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
 * set the startTime of Rental
 * Get the index from Location.History to fetch positions only for this rental
 *
 * @returns {Promise<void>}
 */
schema.methods.startRental = async function () {
  //console.log("Before save:", this);
  const loc = await this.constructor.getLocationByScooter(this.scooter);

  this.startTime = new Date();
  this.startHistoryIndex = loc.history.length;

  await this.save();
};

/**
 * returns duration of the rental in minutes to be used in cost calculation
 *
 * @returns {number} Duration in minutes if both start and end Time exist
 */
schema.methods.getDurationMinutes = function () {
  if (!this.startTime || !this.endTime) return 0;
  return Math.ceil((this.endTime - this.startTime) / 60000);
};

/**
 * calucalte cost of the rental based  upon duration and start fees
 *
 * @returns {number} The calculated cost.
 */
schema.methods.calculateCost = function () {
  const minutes = this.getDurationMinutes();
  if (minutes === 0) return 0;

  const startFee = 10;
  const pricePerMinute = 2;

  return startFee + minutes * pricePerMinute;
};

/**
 * End the rental, set the endTime and extract movement history and save the cost
 *
 * @returns {Promise<Rental>} updated rental document
 */
schema.methods.endRental = async function () {
  const loc = await this.constructor.getLocationByScooter(this.scooter);

  this.endTime = new Date();
  this.tripHistory = loc.history.slice(this.startHistoryIndex);

  //här skulle vi kunna hämta status på cykel när det gäller godkänd parkering och ge en bonus eller panelty eller vad tcyks?
  //skicka med status till calculatecost så har vi löst det??
  this.cost = this.calculateCost();
  await this.save();

  return this;
};

/**
 * virtual property that returns duration in minutes
 * we can use it to show the time at the end of the journey with map (polyline)
 *
 * @returns {number|null} Duration in minutes or null if not completed
 */
schema.virtual("durationMinutes").get(function () {
  return this.getDurationMinutes();
});

/**
 * fetch the Location document associated with a scooter
 * if no document exists, create one.
 *
 * @param {string} scooterId pass the scooter id
 * @returns {Promise<Location>} The Location document
 */
schema.statics.getLocationByScooter = async function (scooterId) {
  const Location = mongoose.model("Location");
  let loc = await Location.findOne({ scooterId });

  if (!loc) {
    loc = await Location.insertOne({ scooterId });
  }

  return loc;
};

const Rental = model("Rental", schema);
export default Rental;
