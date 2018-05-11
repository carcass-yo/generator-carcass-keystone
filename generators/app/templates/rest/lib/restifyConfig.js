const keystone = require('keystone');

const { BAD_REQUEST, NOT_FOUND, AppError } = keystone.get('errors');

// Default restify settings
module.exports = {
  lean: false,
  private: [
    '_keywords',
  ],
  findOneAndUpdate: false,
  findOneAndRemove: false,
  access: (req) => {
    if (req.user && req.user.isAdmin) return 'private';
    if (req.user) return 'protected';
    return 'public';
  },
  onError: (err, req, res, next) => {
    if (err.name === 'CastError') {
      req.erm.statusCode = 400;
      // eslint-disable-next-line no-param-reassign
      err.message = 'Invalid ID supplied';
    }

    const code = req.erm.statusCode;
    const msg = err.message;
    let error;

    if (code === 404) {
      error = new NOT_FOUND(msg);
    } else if (code < 500 && code >= 400) {
      error = new BAD_REQUEST(msg, code);
    } else {
      error = new AppError(msg, code);
    }

    next(error);
  },
};

/* eslint-disable */
/**
 * @swagger
 * definitions:
 *   RestifyCount:
 *     type: 'object'
 *     properties:
 *       count:
 *         type: 'number'
 *         description: 'Количество записей'
 * parameters:
 *   RestifyID:
 *     in: 'path'
 *     name: 'id'
 *     description: 'ID записи'
 *     required: true
 *     schema:
 *       type: 'string'
 *       format: 'ObjectID'
 *   RestifySort:
 *     in: 'query'
 *     name: 'sort'
 *     description: 'Порядок сортировки. Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'string'
 *   RestifySkip:
 *     in: 'query'
 *     name: 'skip'
 *     description: 'Пропустить n элементов. Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'integer'
 *   RestifyLimit:
 *     in: 'query'
 *     name: 'limit'
 *     description: 'Ограничить выборку n элементами. Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'integer'
 *   RestifyQuery:
 *     in: 'query'
 *     name: 'query'
 *     description: 'Фильтр выборки (JSON). Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'string'
 *   RestifyPopulate:
 *     in: 'query'
 *     name: 'populate'
 *     description: 'Развернуть поля, в которых указана привязка к другим элементам (JSON). Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'string'
 *   RestifySelect:
 *     in: 'query'
 *     name: 'select'
 *     description: 'Указывает, какие поля необходимо вернуть в выборке. Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'string'
 *   RestifyDistinct:
 *     in: 'query'
 *     name: 'distinct'
 *     description: 'Указывает, какие поля необходимо вернуть в выборке. Подробнее: https://florianholzapfel.github.io/express-restify-mongoose/#querying'
 *     schema:
 *       type: 'string'
 */
