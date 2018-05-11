const AppError = require('./AppError');

module.exports = class CREATE_ERROR extends AppError {
  /**
   * CREATE_ERROR constructor
   * @param {String} [message] error message, "Invalid data" by default
   * @param {Number} [code] http status code, 400 by default
   */
  constructor(message = 'Invalid data', code = 400) {
    super(message, code);
  }
};
