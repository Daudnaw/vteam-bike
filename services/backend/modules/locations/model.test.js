import { expect } from "chai";
import mongoose from "mongoose";
import Location from "./model.js";

const DB_URI = "mongodb://localhost:27017/vteam-test";
const details = {
  scooterId: new mongoose.Types.ObjectId(),
  current: { lat: 59.3293, lng: 18.0686 },
};

describe("Location model", () => {
  before(async () => {
    await mongoose.connect(DB_URI);
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Location.deleteMany({});
  });

  describe("validation", () => {
    it("should validate if all fields are OK", async () => {
      const location = new Location(details);
      await location.validate();
    });

    it("should be invalid if current position is missing", async () => {
      const location = new Location({ ...details, current: undefined });
      let error;
      try {
        await location.validate();
      } catch (err) {
        error = err;
      }
      expect(error).to.exist;
      // kolla i emsage?
      expect(error.message).to.match(/current/);
    });

    it("should be invalid if current.lat is missing", async () => {
      const location = new Location({ ...details, current: { lng: 18.0686 } });
      let error;
      try {
        await location.validate();
      } catch (err) {
        error = err;
      }
      expect(error).to.exist;
      // Kolla i error.message
      expect(error.message).to.match(/lat/);
    });

    it("should be invalid if current.lng is missing", async () => {
      const location = new Location({ ...details, current: { lat: 59.3293 } });
      let error;
      try {
        await location.validate();
      } catch (err) {
        error = err;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/lng/);
    });
  });

  describe("position methods", () => {
    it("addPosition moves current to history and updates current", async () => {
      const location = new Location(details);
      await location.save();

      await location.addPosition(59.0, 18.0);
      const updated = await Location.findById(location._id);

      expect(updated.history).to.have.length(1);
      expect(updated.history[0].lat).to.equal(details.current.lat);
      expect(updated.history[0].lng).to.equal(details.current.lng);

      expect(updated.current.lat).to.equal(59.0);
      expect(updated.current.lng).to.equal(18.0);
    });

    it("getLatestPosition returns the current position", async () => {
      const location = new Location(details);
      await location.save();

      const latest = location.getLatestPosition();
      expect(latest.lat).to.equal(details.current.lat);
      expect(latest.lng).to.equal(details.current.lng);
    });

    it("getHistory returns an array of previous positions", async () => {
      const location = new Location(details);
      await location.save();

      await location.addPosition(59.0, 18.0);
      const updated = await Location.findById(location._id);
      const history = updated.getHistory();

      expect(history).to.have.length(1);
      expect(history[0].lat).to.equal(details.current.lat);
      expect(history[0].lng).to.equal(details.current.lng);
    });
  });

  describe("toJSON transform", () => {
    it("removes __v and stringifies _id", () => {
      const location = new Location({
        ...details,
        _id: "507f1f77bcf86cd799439011",
      });

      const json = location.toJSON();

      expect(json).to.have.property("_id", "507f1f77bcf86cd799439011");
      expect(json).to.not.have.property("__v");
    });
  });
});
