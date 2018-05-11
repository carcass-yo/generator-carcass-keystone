const keystone = require('keystone');
const passport = require('passport');
const VKontakteStrategy = require('passport-vkontakte').Strategy;

const { VKONTAKTE_APP_ID, VKONTAKTE_APP_SECRET } = process.env;

module.exports = () => {
  const UserModel = keystone.list('User').model;

  // Add vkontakte strategy in passport
  passport.use(new VKontakteStrategy(
    {
      clientID: VKONTAKTE_APP_ID,
      clientSecret: VKONTAKTE_APP_SECRET,
      callbackURL: '/api/v1/User/auth.vkontakte/callback',
      scope: [
        'email',
      ],
      profileFields: [
        'email',
        'contacts',
        'photo_100',
      ],
      apiVersion: '5.74',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, params, profile, done) => {
      // eslint-disable-next-line no-underscore-dangle
      const json = profile._json;

      // Authorize user by vkontakteId
      return UserModel.findOne({ vkontakteId: json.id }).exec()
        .then((doc) => {
          let user = doc;

          // If user found return him
          if (user) return user;

          // Set vkontakteId for already authorized user
          if (req.user) {
            req.user.vkontakteId = profile.id;
            return req.user.save();
          }

          // Or Create new user if not found
          // TODO: load avatar from vk
          user = new UserModel({
            email: params.email,
            phone: json.mobile_phone || '',
            name: {
              first: json.first_name,
              last: json.last_name,
            },
            vkontakteId: json.id,
          });
          return user.save();
        })
        .then(user => done(null, user))
        .catch(done);
    },
  ));
};
