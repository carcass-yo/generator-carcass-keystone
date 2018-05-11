const keystone = require('keystone');
const passport = require('passport');

const { BAD_REQUEST } = keystone.get('errors');
const gt = keystone.get('gettext');
const strategies = keystone.get('passport');
const strategiesNamesList = Object.keys(strategies).filter(i => i !== 'local');

function startSession(req, res, next) {
  return new Promise((resolve) => {
    // start keystone session
    keystone.session.signinWithUser(req.user, req, res, user => resolve(user));
  })
    .then(user => user.populate('avatar').execPopulate())
    .then(user => user.prepareApiOutput(req.locale))
    .then((user) => {
      req.data = user;
      next();
    })
    .catch(next);
}

function checkStrategySupport(req, res, next) {
  const { strategy } = req.params;
  if (!strategiesNamesList.includes(strategy)) {
    return next(new BAD_REQUEST(gt.gettext('Указанная стратегия аутентификации не поддерживается')));
  }
  return next();
}

function callStrategy(req, res, next) {
  return passport.authenticate(req.params.strategy, {
    failWithError: true,
    failureMessage: true,
    lang: req.language,
  })(req, res, next);
}

const controller = (app) => {
  const router = keystone.createRouter();

  router.post(
    '/api/v1/User/login',
    passport.authenticate('local', { failWithError: true, failureMessage: true }),
    startSession,
    (req, res) => res.apiResponse(req.data),
  );

  router.all('/api/v1/User/logout', (req, res, next) => {
    keystone.session.signout(req, res, (err) => {
      if (err) return next(err);
      req.logout();
      return res.apiResponse(null);
    });
  });

  router.get('/api/v1/User/auth.:strategy', checkStrategySupport, callStrategy);
  router.get(
    '/api/v1/User/auth.:strategy/callback',
    checkStrategySupport,
    callStrategy,
    startSession,
    (req, res) => res.redirect('/'),
  );

  app.use('/', router);
};

// TODO: disable keystone auth mechanism, when login page will be created
const keystoneAuth = (req, res, next) => {
  next();
};

module.exports = {
  controller,
  keystoneAuth,
};

/* eslint-disable */
/**
 * @swagger
 * /User/login:
 *   post:
 *     tags:
 *     - 'User'
 *     summary: 'Аутентификация пользователя по логину (email/телефон) и паролю'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - in: 'body'
 *       name: 'body'
 *       description: 'Данные для входа'
 *       required: true
 *       schema:
 *         type: 'object'
 *         properties:
 *           login:
 *             type: 'string'
 *             description: 'E-mail или номер телеофона'
 *           password:
 *             type: 'string'
 *             description: 'Пароль'
 *     responses:
 *       200:
 *         description: 'Возвращает данные авторизованного пользователя'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       401:
 *         description: 'Возвращает ошибку SIGN_IN_ERROR по ряду причин: не указаны параметры для входа, по указанным параметрам не найдено пользователей, неверный пароль'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /User/logout:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Выход из аккаунта'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         schema:
 *           type: null
 *
 * /User/auth.vkontakte:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Аутентификация пользователя через соц.сеть Вконтакте'
 *     description: 'Авторизует существующего или создает нового пользователя. Если пользователь уже авторизован, делает привязку профиля во Вконтакте. После редиректит на /api/v1/User/auth.vkontakte/callback, ПОЭТОМУ НЕ ЗАПУСКАТЬ ЧЕРЕЗ SWAGGER!'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         description: 'Возвращает данные авторизованного пользователя'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       500:
 *         description: 'Возвращает ошибку, если не удалось авторизоваться'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /User/auth.facebook:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Аутентификация пользователя через соц.сеть Facebook'
 *     description: 'Авторизует существующего или создает нового пользователя. Если пользователь уже авторизован, делает привязку профиля во Facebook. После редиректит на /api/v1/User/auth.vkontakte/callback, ПОЭТОМУ НЕ ЗАПУСКАТЬ ЧЕРЕЗ SWAGGER!'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         description: 'Возвращает данные авторизованного пользователя'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       500:
 *         description: 'Возвращает ошибку, если не удалось авторизоваться'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
