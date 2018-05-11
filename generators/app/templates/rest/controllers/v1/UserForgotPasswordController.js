const keystone = require('keystone');

const router = keystone.createRouter();
const { BAD_REQUEST, NOT_FOUND } = keystone.get('errors');
const gt = keystone.get('gettext');
const UserModel = keystone.list('User').model;
const ForgotPassword = keystone.list('ForgotPassword').model;

// router.use(keystone.middleware.api);

function initForgotPasswordApi(req, res, next) {
  req.fp = {};
  next();
}

async function findUser(req, res, next) {
  let { phone } = req.body;
  phone = keystone.utils.clearPhone(phone);

  try {
    if (!phone) {
      throw new BAD_REQUEST(gt.gettext('Поле `phone` не заполнено'));
    }

    req.fp.user = await UserModel.findOne({ phone }).exec();

    if (!req.fp.user) {
      throw new NOT_FOUND(gt.gettext('Пользователь с таким номером телефона не найден'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
}

async function createForgotPassword(req, res, next) {
  try {
    const fp = new ForgotPassword({
      user: req.fp.user,
    });

    req.fp.data = await fp.save();
    req.fp.data = await req.fp.data.prepareApiOutput(req.locale);

    return next();
  } catch (e) {
    return next(e);
  }
}

/**
 * Response data
 * @param {Object} req
 * @param {Object} res
 */
function response(req, res) {
  res.apiResponse(req.fp.data);
}

async function findForgotPassword(req, res, next) {
  try {
    req.fp.forgotPassword = await ForgotPassword.findById(req.params._id).exec();

    if (!req.fp.forgotPassword) {
      throw new NOT_FOUND(gt.gettext('Запроса на изменение пароля с переданным id не существует'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
}

async function checkForgotPassword(req, res, next) {
  try {
    const { password } = req.body;

    // check passed password with forgotPassword, save user to authorize him later
    req.fp.user = await req.fp.forgotPassword.check(password);

    // Remove forgotPassword to prevent it's reuse
    await req.fp.forgotPassword.remove();

    return next();
  } catch (e) {
    return next(e);
  }
}

async function startSession(req, res, next) {
  try {
    let user = await (async () =>
      new Promise((resolve, reject) => {
        req.logIn(req.fp.user, { session: true }, (err) => {
          if (err) return reject(err);

          return keystone.session.signinWithUser(
            req.fp.user,
            req,
            res,
            () => resolve(req.user),
          );
        });
      })
    )();

    user = await user.populate('avatar').execPopulate();
    req.fp.data = await user.prepareApiOutput(req.locale);
    return next();
  } catch (e) {
    return next(e);
  }
}

router.post('/api/v1/ForgotPassword', initForgotPasswordApi, findUser, createForgotPassword, response);
router.post('/api/v1/ForgotPassword/:_id/check', initForgotPasswordApi, findForgotPassword, checkForgotPassword, startSession, response);

module.exports = (app) => {
  app.use('/', router);
};

/* eslint-disable */
/**
 * @swagger
 * /ForgotPassword:
 *   post:
 *     tags:
 *     - 'User'
 *     summary: 'Создать запрос на сброс пароля'
 *     description: 'Данный метод создает запрос на сброс пароля и отправляет СМС с новым паролем пользователю. Пароль пользователя будет сменен после метода /ForgotPassword/{id}/check.'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - in: 'body'
 *       name: 'body'
 *       description: 'Номер телефона пользователя'
 *       required: true
 *       schema:
 *         type: 'object'
 *         properties:
 *           phone:
 *             type: 'string'
 *     responses:
 *       200:
 *         description: 'Возвращает id запроса на сброс пароля'
 *         schema:
 *         type: 'object'
 *         properties:
 *           _id:
 *             type: 'string'
 *
 *       404:
 *         description: 'Возвращает ошибку NOT_FOUND, если пользователь не найден'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /ForgotPassword/{id}/check:
 *   post:
 *     tags:
 *     - 'User'
 *     summary: 'Сброс пароля пользователя'
 *     description: 'Данный метод сбрасывает пароль пользователя, стартует сессию, а так же удаляет запрос на сброс пароля, чтобы им нельзя было воспользоваться дважды.'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     - in: 'body'
 *       name: 'body'
 *       description: 'Пароль из СМС'
 *       required: true
 *       schema:
 *         type: 'object'
 *         properties:
 *           password:
 *             type: 'string'
 *     responses:
 *       200:
 *         description: 'Авторизовывает пользователя и возвращает его данные'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       404:
 *         description: 'Возвращает ошибку NOT_FOUND, если запрос на сброс не найден'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
