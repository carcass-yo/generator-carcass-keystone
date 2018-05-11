const AppError = require('./AppError');

module.exports = class SIGN_IN_ERROR extends AppError {
  /**
   * SIGN_IN_ERROR constructor
   * @param {String} [message] error message, "SIGN_IN_ERROR" by default
   * @param {Number} [code] http status code, 500 by default
   */
  constructor(message = 'SIGN_IN_ERROR', code) {
    super(message, code);
  }
};
