import { expect } from "chai";
import Zone from "./model.js";

const details = {
  name: "stockholm parkering",
  type: "polygon",
  area: [
    [59.3430, 18.0600],
    [59.3380, 18.0850],
    [59.3300, 18.0750],
    [59.3210, 18.0650],
    [59.3230, 18.0450],
    [59.3360, 18.0450]
  ],
  active: true,
  zoneType: "parking",
};

describe("Zone model", () => {
  
  describe("validation", () => {
    it("should validate if all fealds are OK", async () =>{
      const zone = new Zone(details);

      await zone.validate();
    });

    it("should be invalid if name is empty", async () => {
      const zone = new Zone({ ...details, name: undefined });

      let error;
      try {
        await zone.validate();
      } catch (err) {
        error = err;
      }
      
      expect(error).to.exist;
      expect(error.message).to.match(/Path `name` is required/);
    });

    it("should be invalid if type is empty", async () => {
      const zone = new Zone({ ...details, type: undefined });

      let error;
      try {
        await zone.validate();
      } catch (err) {
        error = err;
      }
      
      expect(error).to.exist;
      expect(error.message).to.match(/Path `type` is required/);
    });

    it("should be fasle if active is empty", async () => {
      const zone = new Zone({ ...details, active: undefined });

      await zone.validate();

      expect(zone.active).to.equal(false);
    });

    it("should be invalid if zoneType is empty", async () => {
      const zone = new Zone({ ...details, zoneType: undefined });

      let error;
      try {
        await zone.validate();
      } catch (err) {
        error = err;
      }
      
      expect(error).to.exist;
      expect(error.message).to.match(/Path `zoneType` is required/);
    });

    it("should be valid for allowed zone types", async () => {
      const zone = new Zone({ ...details, zoneType: "parking" });

      let error;
      try {
        await zone.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.not.exist;
    });

    it("should be valid for allowed maxSpeed", async () => {
      const zone = new Zone({ ...details, maxSpeed: 20 });

      let error;
      try {
        await zone.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.not.exist;
      expect(zone.maxSpeed).to.equal(20);
    });
  });

  describe("toJSON transform", () => {
    it("removes __v and stringifies _id", () => {
      const zone = new Zone({
        ...details,
        _id: "507f1f77bcf86cd799439011",
      });

      const json = zone.toJSON();

      expect(json).to.have.property("id", "507f1f77bcf86cd799439011");
      expect(json).to.not.have.property("__v");
    });
  });

  describe("is parking", () => {
    it("check if parking zone, true", async () => {
      const zone = new Zone(details);

      expect(await zone.isParkingZone()).to.equal(true);
    });

    it("check if parking zone, false", async () => {
      const zone = new Zone({ ...details, zoneType: "speed_limit" });

      expect(await zone.isParkingZone()).to.equal(false);
    });
  });
});
