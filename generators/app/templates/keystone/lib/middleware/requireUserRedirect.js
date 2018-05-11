/**
 * Prevents people from accessing protected pages when they're not signed in
 * @param {object} req (request object)
 * @param {object} res (response object)
 * @param {function} next (callback function)
 * @return {*} skip middleware
 */
module.exports = (req, res, next) => {
  if (req.user) return next();

  req.flash('error', 'Please sign in to access this page.');
  return res.redirect('/keystone/signin');
};
