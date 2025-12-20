import { expect } from "chai";
import mongoose from "mongoose";
import Location from "../locations/model.js";
import Rental from "./model.js";


const DB_URI = "mongodb://localhost:27017/vteam-test";
const scooterId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const locationDetails = {
  scooterId,
  current: { lat: 59.3293, lng: 18.0686 },
  history: [],
};

describe("Rental model", () => {
  before(async () => {
    await mongoose.connect(DB_URI);
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Location.deleteMany({});
  });

  describe("validation", () => {
    it("should validate if all required fields are ok", async () => {
      const rental = new Rental({ user: userId, scooter: scooterId });
      await rental.validate();
    });

    it("should be invalid if user is missing", async () => {
      const rental = new Rental({ scooter: scooterId });
      let error;
      try {
        await rental.validate();
      } catch (err) {
        error = err;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/user/);
    });

    it("should be invalid if scooter is missing", async () => {
      const rental = new Rental({ user: userId });
      let error;
      try {
        await rental.validate();
      } catch (err) {
        error = err;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/scooter/);
    });
  });

  describe("rental methods", () => {
    it("startRental sets startTime", async () => {
      const location = new Location(locationDetails);
      await location.save();

      const rental = new Rental({ user: userId, scooter: scooterId });
      await rental.startRental();

      expect(rental.startTime).to.exist;
      expect(rental.startHistoryIndex).to.equal(location.history.length);
    });

    it("endRental sets endTime, tripHistory slice, and calculates cost", async () => {
      const location = new Location({ ...locationDetails, history: [{ lat: 59.1, lng: 18.1 }, { lat: 59.2, lng: 18.2 }] });
      await location.save();

      const rental = new Rental({ user: userId, scooter: scooterId });
      await rental.startRental();

      location.history.push({ lat: 59.3, lng: 18.3 });
      location.history.push({ lat: 59.4, lng: 18.4 });
      await location.save();

      await rental.endRental();

      expect(rental.endTime).to.exist;
      expect(rental.tripHistory).to.have.length(location.history.length - rental.startHistoryIndex);
      expect(rental.cost).to.be.a("number").that.is.greaterThan(0);
    });

    it("getDurationMinutes returns correct value", async () => {
      const rental = new Rental({ user: userId, scooter: scooterId });
      rental.startTime = new Date(Date.now() - 5 * 60 * 1000); // 5 min sedan
      rental.endTime = new Date();
      expect(rental.getDurationMinutes()).to.be.within(4, 6);
    });

    it("calculateCost returns correct cost", async () => {
      const rental = new Rental({ user: userId, scooter: scooterId });
      rental.startTime = new Date(Date.now() - 5 * 60 * 1000);
      rental.endTime = new Date();
      expect(rental.calculateCost()).to.equal(10 + 5 * 2);
    });

    it("endRental correctly slices tripHistory, with multiple Location updates", async () => {
      const location = new Location({
        scooterId,
        current: { lat: 59.0, lng: 18.0 },
        history: [
          { lat: 59.01, lng: 18.01 },
          { lat: 59.02, lng: 18.02 },
        ],
      });
      await location.save();

      const rental = new Rental({ user: userId, scooter: scooterId });
      await rental.startRental(); // startHistoryIndex = 2

      location.history.push({ lat: 59.03, lng: 18.03 });
      location.history.push({ lat: 59.04, lng: 18.04 });
      await location.save();

      await rental.endRental();

      expect(rental.tripHistory).to.have.length(2);
      expect(rental.tripHistory[0].lat).to.equal(59.03);
      expect(rental.tripHistory[1].lat).to.equal(59.04);
      expect(rental.endTime).to.exist;
      expect(rental.cost).to.be.a("number").that.is.greaterThan(0);
    });
  });

  describe("virtuals", () => {
    it("durationMinutes virtual returns correct value", async () => {
      const rental = new Rental({ user: userId, scooter: scooterId });
      rental.startTime = new Date(Date.now() - 10 * 60 * 1000);
      rental.endTime = new Date();
      expect(rental.durationMinutes).to.be.within(9, 11);
    });
  });

  describe("toJSON transform", () => {
    it("removes __v and stringifies _id", () => {
      const rental = new Rental({
        user: userId,
        scooter: scooterId,
        _id: "507f1f77bcf86cd799439011",
      });

      const json = rental.toJSON();

      expect(json).to.have.property("_id", "507f1f77bcf86cd799439011");
      expect(json).to.not.have.property("__v");
    });
  });
});
