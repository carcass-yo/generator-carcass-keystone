const keystone = require('keystone');

const { BAD_REQUEST } = keystone.get('errors');
const gt = keystone.get('gettext');

/**
 * Prevents anybody, who not admin, from accessing protected pages
 * @param {object} req (request object)
 * @param {object} res (response object)
 * @param {function} next (callback function)
 * @return {*} redirect on home if no user or user is not admin
 */
module.exports = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(new BAD_REQUEST(gt.gettext('Для выполнения данного действия необходимы права администратора')));
  }

  return next();
};
