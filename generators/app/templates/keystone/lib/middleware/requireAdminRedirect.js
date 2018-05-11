/**
 * Prevents anybody, who not admin, from accessing protected pages
 * @param {object} req (request object)
 * @param {object} res (response object)
 * @param {function} next (callback function)
 * @return {*} redirect on home if no user or user is not admin
 */
module.exports = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    req.flash('error', 'Please sign in to access this page.');
    // TODO: redirect to login page
    return res.redirect('/');
  }

  return next();
};
