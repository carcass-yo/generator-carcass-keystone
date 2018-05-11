const AppError = require('./AppError');

module.exports = class NOT_AUTH extends AppError {
  /**
   * NOT_AUTH constructor
   * @param {String} [message] error message, "Unauthorized" by default
   * @param {Number} [code] http status code, 401 by default
   */
  constructor(message = 'Unauthorized', code = 401) {
    super(message, code);
  }
};
