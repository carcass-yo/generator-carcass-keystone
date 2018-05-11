const keystone = require('keystone');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const { SIGN_IN_ERROR } = keystone.get('errors');
const gt = keystone.get('gettext');

module.exports = () => {
  const UserModel = keystone.list('User').model;

  // Add local strategy in passport
  passport.use(new LocalStrategy(
    {
      usernameField: 'login',
      badRequestMessage: 'Missing credentials',
    },
    (email, password, done) => {
      const INVALID_CREDENTIALS_MESSAGE = gt.gettext('Неверные имя пользователя или пароль');
      const phone = keystone.utils.clearPhone(email);

      // Find user by email or phone
      UserModel.findOne({
        $or: [
          { email },
          { phone },
        ],
      }).exec()
      // Check password
        .then(user =>
          new Promise((resolve, reject) => {
            if (!user) {
              return reject(new SIGN_IN_ERROR(INVALID_CREDENTIALS_MESSAGE, 401));
            }

            return user._.password.compare(password, (err, result) => {
              if (err) return reject(err);
              if (!result) {
                return reject(new SIGN_IN_ERROR(INVALID_CREDENTIALS_MESSAGE, 401));
              }
              return resolve(user);
            });
          }))
        .then(user => done(null, user))
        .catch(done);
    },
  ));
};
