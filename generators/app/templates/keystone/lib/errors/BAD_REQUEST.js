const AppError = require('./AppError');

module.exports = class BAD_REQUEST extends AppError {
  /**
   * BAD_REQUEST constructor
   * @param {String} [message] error message, "Forbidden" by default
   * @param {Number} [code] http status code, 400 by default
   */
  constructor(message = 'Forbidden', code = 400) {
    super(message, code);
  }
};
