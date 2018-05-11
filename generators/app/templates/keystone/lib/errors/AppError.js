module.exports = class AppError extends Error {
  /**
   * AppError constructor
   * @param {String} [message] error message
   * @param {Number} [code] http status code
   */
  constructor(message, code = 500) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.code = code;
  }
};
