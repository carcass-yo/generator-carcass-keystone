const AppError = require('./AppError');

module.exports = class DELETE_ERROR extends AppError {
  /**
   * DELETE_ERROR constructor
   * @param {String} [message] error message, "DELETE_ERROR" by default
   * @param {Number} [code] http status code, 500 by default
   */
  constructor(message = 'DELETE_ERROR', code) {
    super(message, code);
  }
};
