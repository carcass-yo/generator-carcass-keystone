const keystone = require('keystone');

const FileModel = keystone.list('File').model;
const router = keystone.createRouter();
const { NOT_FOUND } = keystone.get('errors');
const { requireUserApi } = keystone.get('middleware');
const gt = keystone.get('gettext');

/**
 * Connect middleware that build query by passed request query options
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function buildQuery(req, res, next) {
  let query = req.mongooseQuery;

  if (!query) {
    query = FileModel.find();
  }

  try {
    // Query param must be JSON
    if (req.query.query) {
      req.query.query = JSON.parse(req.query.query);
      query.where(req.query.query);
    }

    // Skip param must be integer
    if (req.query.skip) {
      req.query.skip = parseInt(req.query.skip, 10);
      query.skip(req.query.skip);
    }

    // Limit param must be integer
    if (req.query.limit && query.op !== 'count') {
      req.query.limit = parseInt(req.query.limit, 10);
      query.limit(req.query.limit);
    }

    if (req.query.sort) {
      // Sort param may be JSON
      try {
        req.query.sort = JSON.parse(req.query.sort);
      } catch (e) {
        // Or may not to be :)
      }

      query.sort(req.query.sort);
    }
  } catch (e) {
    return next(e);
  }

  req.mongooseQuery = query;

  return next();
}

/**
 * Connect middleware that execute passed req.mongooseQuery
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function execQuery(req, res, next) {
  try {
    req.data = await req.mongooseQuery.exec();
  } catch (e) {
    return next(e);
  }

  return next();
}

/**
 * Connect middleware that get file by id
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function getById(req, res, next) {
  try {
    req.data = await FileModel.findById(req.params.id).exec();
  } catch (e) {
    return next(e);
  }

  if (!req.data) return next(new NOT_FOUND(gt.gettext('File not found')));
  return next();
}

/**
 * Connect middleware that prepare API output
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

/**
 * Set count query
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function countQuery(req, res, next) {
  req.mongooseQuery = FileModel.count();
  next();
}

/**
 * Adapter from mongoose count query result to express-restify-mongoose format
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function countResultAdapter(req, res, next) {
  req.data = { count: req.data };
  next();
}

/**
 * Upload new file
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
async function createItem(req, res, next) {
  const file = new FileModel({
    createdAt: new Date(),
    createdBy: req.user,
  });

  const uploadFile = async () =>
    new Promise((resolve, reject) => {
      file._.file.update({ file: 'upload:file' }, req.files, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });

  try {
    await uploadFile();
    await file.save();
  } catch (e) {
    return next(e);
  }

  req.data = file;

  return next();
}

function deleteQuery(req, res, next) {
  let context = {};

  if (req.user && !req.user.isAdmin) {
    context = { createdBy: req.user };
  }

  req.mongooseQuery = FileModel.find(context);

  return next();
}

async function deleteItem(req, res, next) {
  try {
    const docs = await req.mongooseQuery.where({ _id: req.params.id }).exec();
    await Promise.all(docs.map(async d => d.remove()));
  } catch (e) {
    return next(e);
  }

  req.data = null;

  return next();
}

const MANY_URI = '/api/v1/File';
const ONE_URI = `${MANY_URI}/:id`;
router.get(MANY_URI, buildQuery, execQuery, prepareOutput, response);
router.get(`${MANY_URI}/count`, countQuery, buildQuery, execQuery, countResultAdapter, response);
router.get(ONE_URI, getById, prepareOutput, response);
router.post(MANY_URI, requireUserApi, createItem, prepareOutput, response);
router.delete(ONE_URI, requireUserApi, deleteQuery, deleteItem, response);

module.exports = (app) => {
  app.use('/', router);
};

/* eslint-disable */
/**
 * @swagger
 * tags:
 * - name: 'File'
 *   description: 'Операции с медиа-файлами'
 *
 * /File:
 *   get:
 *     tags:
 *     - 'File'
 *     summary: 'Получить все медиа-файлы'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifySort'
 *     - $ref: '#/parameters/RestifySkip'
 *     - $ref: '#/parameters/RestifyLimit'
 *     - $ref: '#/parameters/RestifyQuery'
 *     responses:
 *       200:
 *         description: 'Возвращает массив файлов'
 *         schema:
 *           type: 'array'
 *           items:
 *             $ref: '#/definitions/File'
 *
 *   post:
 *     tags:
 *     - 'File'
 *     summary: 'Загрузить новый медиа-файл'
 *     description: 'Загрузить новый медиа-файл. Функция не доступна неавторизованным пользователям.'
 *     consumes:
 *     - multipart/form-data
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - in: 'formData'
 *       name: 'file'
 *       type: 'file'
 *       description: 'Файл для загрузки.'
 *     responses:
 *       200:
 *         description: 'Возвращает информацию о созданном файле'
 *         schema:
 *           $ref: '#/definitions/File'
 *
 *       401:
 *         description: 'Возвращает ошибку NOT_AUTH, если пользователь не авторизован'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /File/{id}:
 *   get:
 *     tags:
 *     - 'File'
 *     summary: 'Получить файл по ID'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     responses:
 *       200:
 *         description: 'Возвращает файл'
 *         schema:
 *           $ref: '#/definitions/File'
 *
 *       404:
 *         description: 'Файл с переданным ID не найдена'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *   delete:
 *     tags:
 *     - 'File'
 *     summary: 'Получить файл по ID'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifyID'
 *     responses:
 *       200:
 *         description: 'Файл удален. Пустой ответ'
 *         schema:
 *           type: null
 *
 *       401:
 *         description: 'Возвращает ошибку NOT_AUTH, если пользотватель не авторизован'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *       404:
 *         description: 'Элеватор с переданным ID не найден'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 *       4xx:
 *         description: 'Возвращает ошибку BAD_REQUEST, если были введены не верные данные'
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *
 * /File/count:
 *   get:
 *     tags:
 *     - 'File'
 *     summary: 'Получить количество файлов'
 *     produces:
 *     - 'application/json'
 *     parameters:
 *     - $ref: '#/parameters/RestifySort'
 *     - $ref: '#/parameters/RestifySkip'
 *     - $ref: '#/parameters/RestifyLimit'
 *     - $ref: '#/parameters/RestifyQuery'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/RestifyCount'
 */
