const keystone = require('keystone');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env;

module.exports = () => {
  const UserModel = keystone.list('User').model;

  // Add facebook strategy in passport
  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: '/api/v1/User/auth.facebook/callback',
      scope: [
        'email',
      ],
      profileFields: [
        'id',
        'first_name',
        'last_name',
        'email',
        'picture{url}',
      ],
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      // eslint-disable-next-line no-underscore-dangle
      const json = profile._json;

      // Authorize user by facebookId
      return UserModel.findOne({ facebookId: json.id }).exec()
        .then((doc) => {
          let user = doc;

          if (user) return user;

          // Set facebookId for already authorized user
          if (req.user) {
            req.user.facebookId = json.id;
            return req.user.save();
          }

          // Create new user if not found
          // TODO: load avatar from facebook
          user = new UserModel({
            email: json.email,
            phone: '',
            name: {
              first: json.first_name,
              last: json.last_name,
            },
            facebookId: json.id,
          });
          return user.save();
        })
        .then(user => done(null, user))
        .catch(done);
    },
  ));
};
