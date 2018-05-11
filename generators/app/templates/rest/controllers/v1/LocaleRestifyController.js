const keystone = require('keystone');

const LocaleModel = keystone.list('Locale').model;
const router = keystone.createRouter();
const { NOT_FOUND } = keystone.get('errors');
const supportedLangs = keystone.get('language options')['supported languages'];
const gt = keystone.get('gettext');

/**
 * Connect middleware that get all supported locales
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function getLocalesList(req, res, next) {
  req.data = await LocaleModel.find({ code: { $in: supportedLangs } }).exec();
  next();
}

/**
 * Connect middleware that get locale by code
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function getLocaleByCode(req, res, next) {
  const { code } = req.params;

  // Check to code be supported
  if (!supportedLangs.includes(code)) return next(new NOT_FOUND(gt.gettext('Locale not found')));

  // Find one Locale by code
  req.data = await LocaleModel.findOne({ code }).exec();

  if (!req.data) return next(new NOT_FOUND(gt.gettext('Locale not found')));

  return next();
}

/**
 * Connect middleware that prepare locales list for API output
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise}
 */
async function prepareOutput(req, res, next) {
  let single = false;
  if (!Array.isArray(req.data)) {
    req.data = [req.data];
    single = true;
  }

  try {
    req.data = await Promise.all(req.data.map(async i => i.prepareApiOutput(req.locale)));
  } catch (e) {
    return next(e);
  }

  if (single) req.data = req.data.pop();

  return next();
}

/**
 * Response data
 * @param {Object} req
 * @param {Object} res
 */
function response(req, res) {
  res.apiResponse(req.data);
}

router.get('/api/v1/Locale', getLocalesList, prepareOutput, response);
router.get('/api/v1/Locale/:code', getLocaleByCode, prepareOutput, response);

module.exports = (app) => {
  app.use('/', router);
};

/* eslint-disable */
/**
 * @swagger
 * tags:
 * - name: 'Locale'
 *   description: 'Доступные локали приложения'
 *
 * /Locale:
 *   get:
 *     tags:
 *     - 'Locale'
 *     summary: 'Получить все локали'
 *     produces:
 *     - 'application/json'
 *     responses:
 *       200:
 *         description: 'Возвращает массив поддерживаемых локалей'
 *         schema:
 *           type: 'array'
 *           items:
 *             $ref: '#/definitions/Locale'
 *
 * /Locale/{code}:
 *   get:
 *     tags:
 *     - 'Locale'
 *     summary: 'Получить локаль по коду'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - in: 'path'
 *       name: 'code'
 *       description: 'Код локали'
 *       required: true
 *       schema:
 *         type: 'string'
 *         format: 'bcp47'
 *     responses:
 *       200:
 *         description: 'Возвращает локаль'
 *         schema:
 *           $ref: '#/definitions/Locale'
 *
 *       404:
 *         description: 'Локаль с переданным кодом не найдена'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /Locale/{code}/setLocale:
 *   get:
 *     tags:
 *     - 'Locale'
 *     summary: 'Переключить текущую локаль по коду'
 *     description: 'Устанавливает локаль для пользователя в куки и редиректит обратно. НЕ ЗАПУСКАТЬ ЧЕРЕЗ SWAGGER!'
 *     parameters:
 *     - in: 'path'
 *       name: 'code'
 *       description: 'Код локали'
 *       required: true
 *       schema:
 *         type: 'string'
 *         format: 'bcp47'
 */
