const keystone = require('keystone');

module.exports = (req, res, next) => {
  /**
   * JSON API Response
   * @param {*} data
   */
  res.apiResponse = (data) => {
    if (req.query.callback) {
      res.jsonp(data);
    } else {
      res.json(data);
    }
  };

  /**
   * API Error Response with logging to console
   * @param {String} _key error key
   * @param {String} _msg error message
   * @param {Error} [err] error object to log
   * @param {Number} [code] response code, `500` by default
   */
  res.apiError = (_key, _msg, err, code = 500) => {
    const key = _key || 'unknown error';
    const message = _msg || 'Error';

    if (keystone.get('logger')) {
      console.error(`${key}: ${message}`);
      if (err) console.error(err.stack);
    }

    res.status(code);
    res.apiResponse({ error: key || 'error', detail: message });
  };

  next();
};
