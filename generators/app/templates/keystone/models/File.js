const keystone = require('keystone');
const path = require('path');
const fs = require('fs');
const Model = require('mongoose/lib/model');

const { Types } = keystone.Field;
const { CREATE_ERROR } = keystone.get('errors');
const storage = keystone.get('storage').uploadStorage;
const File = new keystone.List('File', { track: true, noedit: true });

const IMAGE_MAX_WIDTH = 1600;
const IMAGE_MAX_HEIGHT = 750;
const THUMBNAIL_IMAGE_MAX_WIDTH = 370;
const THUMBNAIL_IMAGE_MAX_HEIGHT = 230;

/**
 * Define model fields
 */
File.add({
  file: {
    label: 'Файл',
    type: Types.File,
    storage,
    initial: true,
  },
});

File.schema.virtual('thumbnail').get(function getThumbnail() {
  if (!this.isImage()) return null;
  const ext = path.extname(this.file.filename);
  return {
    filename: `${path.basename(this.file.filename, ext)}_thumb${ext}`,
  };
});

File.schema.virtual('thumbnailPath').get(function getThumbnailPath() {
  const file = path.resolve(storage.adapter.options.path, this.file.filename);
  const thumbnail = path.parse(file);
  thumbnail.name += '_thumb';
  delete thumbnail.base;
  return path.format(thumbnail);
});


/**
 * Define schema hooks
 */

File.schema.pre('save', keystone.get('hooks').wasNew);

File.schema.pre('save', function validateInput(next) {
  if (!(this.file && this.file.filename)) {
    return next(new CREATE_ERROR('Empty file field'));
  }
  return next();
});

File.schema.pre('save', async function resizeOriginalPicture(next) {
  if (!this.isImage()) return next();

  const filePath = path.resolve(storage.adapter.options.path, this.file.filename);

  try {
    await keystone.utils.resizeImage(filePath, filePath, IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT);
  } catch (e) {
    return fs.unlink(filePath, err => next(err && err.code === 'ENOENT' ? e : err));
  }

  return next();
});

File.schema.pre('save', async function resizeThumbnailPicture(next) {
  if (!this.isImage()) return next();

  const filePath = path.resolve(storage.adapter.options.path, this.file.filename);

  try {
    await keystone.utils.resizeImage(
      filePath,
      this.thumbnailPath,
      THUMBNAIL_IMAGE_MAX_WIDTH,
      THUMBNAIL_IMAGE_MAX_HEIGHT,
    );
  } catch (e) {
    return fs.unlink(filePath, err => next(err && err.code === 'ENOENT' ? e : err));
  }

  return next();
});

File.schema.pre('remove', function removeOriginalFile(next) {
  storage.removeFile(this.file, next);
});

File.schema.pre('remove', function removeThumbnailPicture(next) {
  if (!this.isImage()) return next();
  return storage.removeFile(this.thumbnail, next);
});

/**
 * Define schema methods
 */

File.schema.methods.isImage = function isImage() {
  return this.file.mimetype.includes('image');
};

File.schema.methods.prepareApiOutput = async function (locale) {
  const result = await Model.prototype.prepareApiOutput.call(this, locale);

  // Process thumbnail field
  result.thumbnail = this.processFileObject('thumbnail', this.list.fields.file.storage);

  return result;
};


/**
 * Define model relations
 */
File.relationship({
  ref: 'User',
  path: 'users',
  refPath: 'avatar',
});

File.apiFields = [
  '_id',
  'file',
  'thumbnail',
  'createdAt',
];

File.navSection = 'system';
File.defaultSort = '-createdAt';
File.defaultColumns = 'file, createdAt, createdBy';
File.register();
<% if (rest) { %>
/**
 * @swagger
 * definitions:
 *   KeystoneFileObject:
 *     type: 'object'
 *     properties:
 *       filename:
 *         type: 'string'
 *       size:
 *         type: 'number'
 *       mimetype:
 *         type: 'string'
 *       uri:
 *         type: 'string'
 *
 *   File:
 *     type: 'object'
 *     properties:
 *       _id:
 *         type: 'string'
 *       file:
 *         $ref: '#/definitions/KeystoneFileObject'
 *       thumbnail:
 *         $ref: '#/definitions/KeystoneFileObject'
 *       createdAt:
 *         type: 'string'
 *         format: 'dateTime'
 */
<% } %>
