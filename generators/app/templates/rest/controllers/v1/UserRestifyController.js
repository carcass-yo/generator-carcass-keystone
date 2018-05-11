const keystone = require('keystone');
const restify = require('express-restify-mongoose');
const restifyConfig = require('../../lib/restifyConfig');
const _ = require('underscore');

const UserModel = keystone.list('User').model;
const router = keystone.createRouter();
const { NOT_AUTH, BAD_REQUEST } = keystone.get('errors');

const prepareOutput = async (req, res, next) => {
  // Prepare result for operate as array
  let { result } = req.erm;
  if (!Array.isArray(result)) {
    result = [result];
    req.firstOnly = true;
  }

  // Normalize results
  try {
    result = await Promise.all(result.map(async i => i.prepareApiOutput(req.locale)));
  } catch (e) {
    return next(e);
  }

  // Form response
  if (req.firstOnly) result = result.pop();
  req.erm.result = result;
  return next();
};

restify.serve(router, UserModel, Object.assign({}, restifyConfig, {
  preMiddleware: (req, res, next) => {
    // Allow user actions only for authorized requests
    // if (req.method.toLowerCase() !== 'get' && !req.user)
    //   return next(new NOT_AUTH());

    // disable shallow endpoint
    if (req.route.path.toLowerCase().includes('shallow')) return next(new BAD_REQUEST());

    // use GET and DELETE route for current user
    if (
      req.route.path === '/api/v1/User' &&
      ['get', 'delete'].indexOf(req.method.toLowerCase()) >= 0
    ) {
      if (!req.user) return next(new NOT_AUTH());
      req.context = { _id: req.user._id };
      req.firstOnly = true;
    }

    // Prepare populate options
    if (_.isEmpty(req._ermQueryOptions.populate)) {
      req._ermQueryOptions.populate = [];
    }

    if (!Array.isArray(req._ermQueryOptions.populate)) {
      req._ermQueryOptions.populate = [req._ermQueryOptions.populate];
    }

    req._ermQueryOptions.populate.push('avatar');

    return next();
  },
  contextFilter: (model, req, done) => {
    done(model.find(req.context || {}));
  },
  postRead: (req, res, next) => {
    // skip for count endpoint
    if (req.route.path.toLowerCase().includes('count')) return next();

    return prepareOutput(req, res, next);
  },
  postCreate: (req, res, next) => {
    // start session after user created
    req.logIn(req.erm.result, { session: true }, (err) => {
      if (err) return next(err);

      return keystone.session.signinWithUser(
        req.erm.result,
        req,
        res,
        () => prepareOutput(req, res, next),
      );
    });
  },
}));

router.get('/api/v1/User/:_id/rating', async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params._id).exec();
    const rating = await user.rating();
    return res.apiResponse({ rating });
  } catch (e) {
    return next(e);
  }
});

module.exports = (app) => {
  app.use('/', router);
};

/* eslint-disable */
/**
 * @swagger
 * tags:
 * - name: 'User'
 *   description: 'Операции с пользователями'
 *
 * /User:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Получить текущего пользователя'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         description: 'Возвращает данные текущего пользователя, если авторизован'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       401:
 *         description: 'Возвращает ошибку NOT_AUTH, если пользователь не авторизован'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *   post:
 *     tags:
 *     - 'User'
 *     summary: 'Регистрация нового пользователя'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - in: 'body'
 *       name: 'body'
 *       description: 'Регистрационные данные пользователя'
 *       required: true
 *       schema:
 *         $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: 'Регистрирует пользователя и возвращает его данные'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       4xx:
 *         description: 'Возвращает ошибку BAD_REQUEST, если были введены не верные регистрационные данные'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /User/{id}:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Получить информацию по конкретному пользователю'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     responses:
 *       200:
 *         description: 'Возвращает данные пользователя'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       4xx:
 *         description: 'Возвращает ошибку BAD_REQUEST, если был передан некорректный ObjectID'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *       404:
 *         description: 'Пользователь с переданным ID не найден'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *   patch:
 *     tags:
 *     - 'User'
 *     summary: 'Обновить данные пользователя'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     - in: 'body'
 *       name: 'body'
 *       description: 'Данные пользователя'
 *       required: true
 *       schema:
 *         $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: 'Обновляет пользователя и возвращает его данные'
 *         schema:
 *           $ref: '#/definitions/User'
 *
 *       4xx:
 *         description: 'Возвращает ошибку BAD_REQUEST, если были введены не верные данные'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *   delete:
 *     tags:
 *     - 'User'
 *     summary: 'Удалить пользователя'
 *     consumes:
 *     - 'application/json'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     responses:
 *       204:
 *         description: 'Пользователь удален, ответ пустой'
 *         schema:
 *           type: null
 *
 *       404:
 *         description: 'Пользователь с переданным ID не найден'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /User/{id}/rating:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Получить рейтинг пользователя'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     responses:
 *       200:
 *         schema:
 *           type: 'object'
 *           properties:
 *             rating:
 *               type: 'number'
 *               format: 'float'
 *
 * /User/count:
 *   get:
 *     tags:
 *     - 'User'
 *     summary: 'Получить количество зарегистрированных пользователей'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/RestifyCount'
 */
