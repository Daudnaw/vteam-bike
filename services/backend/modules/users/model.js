import { Schema, model } from "mongoose";
import { scrypt as _scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { AuthenticationError } from "../../lib/authentication-error.js";
const scrypt = promisify(_scrypt);

/**
 * @typedef User
 * @property {string} _id
 * @property {string} firstName.required
 * @property {string} lastName.required
 * @property {string} email.required
 * @property {string} password.required
 * @property {string} salt
 * @property {Function} verifyPassword
 * @property {Function} authenticate
 * @property {Function} toJSON
 */

const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Transform the object to be returned as JSON
 * Removes sensitive information before sending the user
 * object to the client
 *
 * @param {Object} schema - The schema of the model
 * @param {Object} ret - The object to be returned
 *
 * @return {Object} - The transformed object
 */
schema.options.toJSON = {
  transform: (_, ret) => {
    ret._id = ret._id.toString();
    delete ret.password;
    delete ret.salt;
    delete ret.__v;
    return ret;
  },
};
/**
 * Hashes the password before saving the user
 *
 * @returns {Promise}
 * @throws {Error}
 */
schema.pre("save", async function () {
  // Early return when password hasn't changed
  if (!this.isModified("password")) return;

  await this.setPassword(this.password);
});

/**
 * Hashes the password before updating the user
 *
 * @returns {Promise}
 * @throws {Error}
 */
schema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (!update.password) return;

  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(update.password, salt, 64);

  update.password = key.toString("hex");
  update.salt = salt;
});

/**
 * Authenticates a user
 *
 * @param {String} email
 * @param {String} password
 *
 * @returns {Promise}
 * @throws {AuthenticationError}
 */
schema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new AuthenticationError(`No such email: ${email}`);

  const valid = await user.verifyPassword(password);

  if (!valid) throw new AuthenticationError("Invalid password");

  return user;
};

/**
 * Verifies the password
 *
 * @param {String} password
 *
 * @returns {Promise}
 */
schema.methods.verifyPassword = async function (password) {
  const key = await scrypt(password, this.salt, 64);

  return key.toString("hex") === this.password;
};

/**
 * Hashes the password and sets salt + password to the user.
 *
 * @param {String} password
 *
 * @returns {Promise}
 */
schema.methods.setPassword = async function (password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);

  this.password = key.toString("hex");
  this.salt = salt;
};

const User = model("User", schema);

export default User;
