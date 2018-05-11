const AppError = require('./AppError');

module.exports = class UPDATE_ERROR extends AppError {
  /**
   * UPDATE_ERROR constructor
   * @param {String} [message] error message, "UPDATE_ERROR" by default
   * @param {Number} [code] http status code, 500 by default
   */
  constructor(message = 'UPDATE_ERROR', code) {
    super(message, code);
  }
};
