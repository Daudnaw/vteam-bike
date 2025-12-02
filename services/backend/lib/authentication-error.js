/**
 * Custom error class for authentication errors
 * Extends the Error class.
 *
 * @class
 * @extends(Error)
 */
export class AuthenticationError extends Error {
  /**
   * Creates an instance of AuthenticationError.
   *
   * @param {string} message - The error message
   * @memberof AuthenticationError
   * @constructor
   */
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}
