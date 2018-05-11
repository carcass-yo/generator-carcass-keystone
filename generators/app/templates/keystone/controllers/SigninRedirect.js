const keystone = require('keystone');

module.exports = () => {
  keystone.set('signin redirect', (user, req, res) =>
    res.redirect(user.isAdmin ? '/keystone' : '/'));
};
