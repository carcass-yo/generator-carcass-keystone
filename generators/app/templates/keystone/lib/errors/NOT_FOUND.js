const AppError = require('./AppError');

module.exports = class NOT_FOUND extends AppError {
  /**
   * NOT_FOUND constructor
   * @param {String} [message] error message, "Not Found" by default
   * @param {Number} [code] http status code, 404 by default
   */
  constructor(message = 'Not Found', code = 404) {
    super(message, code);
  }
};
