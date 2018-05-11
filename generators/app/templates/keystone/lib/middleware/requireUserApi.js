const keystone = require('keystone');

const { NOT_AUTH } = keystone.get('errors');

/**
 * Prevents people from accessing protected API when they're not signed in
 * @param {object} req (request object)
 * @param {object} res (response object)
 * @param {function} next (callback function)
 * @return {*}
 */
module.exports = (req, res, next) => {
  if (!req.user) return next(new NOT_AUTH());
  return next();
};
