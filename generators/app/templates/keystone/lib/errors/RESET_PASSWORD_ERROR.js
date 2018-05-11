const AppError = require('./AppError');

module.exports = class RESET_PASSWORD_ERROR extends AppError {
  /**
   * RESET_PASSWORD_ERROR constructor
   * @param {String} [message] error message, "Reset password error" by default
   * @param {Number} [code] http status code, 400 by default
   */
  constructor(message = 'Reset password error', code = 400) {
    super(message, code);
  }
};
