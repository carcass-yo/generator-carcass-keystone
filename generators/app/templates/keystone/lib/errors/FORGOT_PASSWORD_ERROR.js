const AppError = require('./AppError');

module.exports = class FORGOT_PASSWORD_ERROR extends AppError {
  /**
   * FORGOT_PASSWORD_ERROR constructor
   * @param {String} [message] error message, "Forgot password error" by default
   * @param {Number} [code] http status code, 400 by default
   */
  constructor(message = 'Forgot password error', code = 400) {
    super(message, code);
  }
};
