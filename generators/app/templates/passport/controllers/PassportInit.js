const keystone = require('keystone');
const passport = require('passport');

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const strategies = keystone.get('passport');
  Object.keys(strategies).forEach(key => strategies[key]());
};
