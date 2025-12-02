import { expect } from "chai";
import User from "./model.js";

const details = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "user",
};

describe("User model", () => {
  describe("validation", () => {
    it("should validate if all fields are OK", async () => {
      const user = new User(details);

      await user.validate();
    });

    it("should be invalid if firstName is empty", async () => {
      const user = new User({ ...details, firstName: undefined });

      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.message).to.match(/Path `firstName` is required/);
    });

    it("should be invalid if lastName is empty", async () => {
      const user = new User({ ...details, lastName: undefined });

      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.message).to.match(/Path `lastName` is required/);
    });

    it("should be invalid if email is empty", async () => {
      const user = new User({ ...details, email: undefined });

      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.message).to.match(/Path `email` is required/);
    });

    it("should be invalid if password is empty", async () => {
      const user = new User({ ...details, password: undefined });

      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.message).to.match(/Path `password` is required/);
    });
  });

  describe("toJSON transform", () => {
    it("removes password, salt, __v and stringifies _id", () => {
      const user = new User({
        ...details,
        salt: "abcd",
        _id: "507f1f77bcf86cd799439011",
      });

      const json = user.toJSON();

      expect(json).to.have.property("_id", "507f1f77bcf86cd799439011");
      expect(json).to.not.have.property("password");
      expect(json).to.not.have.property("salt");
      expect(json).to.not.have.property("__v");
    });
  });

  describe("password logic methods", () => {
    it("setPassword hashes and sets salt", async () => {
      const user = new User(details);

      await user.setPassword(details.password);

      expect(user.password).to.not.equal(details.password);
      expect(user.password.length).to.equal(128);
      expect(user.password).to.match(/^[0-9a-fA-F]+$/);

      expect(user.salt).to.be.a("string");
      expect(user.salt.length).to.equal(32);
      expect(user.salt).to.match(/^[0-9a-fA-F]+$/);
    });

    it("verifyPassword matches the hashed password", async () => {
      const user = new User(details);
      await user.setPassword(details.password);

      expect(await user.verifyPassword(details.password)).to.equal(true);
      expect(await user.verifyPassword("wrong")).to.equal(false);
    });
  });
});
