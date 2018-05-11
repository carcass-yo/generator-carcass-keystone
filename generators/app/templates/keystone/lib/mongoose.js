/**
 * Configure custom mongoose instance for app
 */
const mongoose = require('mongoose');
const keystone = require('keystone');
const _ = require('underscore');
const Model = require('mongoose/lib/model');

// Extend Model prototype for often used actions
Model.prototype.processFileObject = function (path, storage) {
  const file = JSON.parse(JSON.stringify(this[path]));
  if (!(file && file.filename)) return null;

  if (!storage) {
    // eslint-disable-next-line no-param-reassign,prefer-destructuring
    storage = this.list.fields[path].storage;
  }

  file.uri = storage.adapter.getFileURL(file);
  return file;
};

Model.prototype.getApiFields = function () {
  return this.list.apiFields ?
    this.list.apiFields :
    ['_id'].concat(Object.keys(this.list.fields));
};

Model.prototype.pickApiFields = function () {
  return _.pick(this, ...this.getApiFields());
};

Model.prototype.prepareApiOutput = async function (locale) {
  const result = Object.assign({}, this.pickApiFields());

  // Prepare related docs for API output
  const apiFields = this.getApiFields();
  const relations = Object.keys(this.list.fields)
    .filter(k => this.list.fields[k].type.toLowerCase() === 'relationship')
    .filter(r => apiFields.includes(r))
    .filter(r => !!this[r]);

  await Promise.all(relations.map(async (k) => {
    if (Array.isArray(this[k])) {
      // many relationship
      result[k] = await Promise.all(this[k].map(r => (
        r.prepareApiOutput ?
          r.prepareApiOutput(locale) :
          r
      )));
    } else {
      // one (basic) relationship
      result[k] = this[k].prepareApiOutput ?
        await this[k].prepareApiOutput(locale) :
        this[k];
    }
  }));

  // Prepare file fields
  const files = Object.keys(this.list.fields)
    .filter(k => this.list.fields[k].type.toLowerCase() === 'file')
    .filter(r => apiFields.includes(r))
    .filter(r => !!this[r]);

  files.forEach((k) => {
    result[k] = this.processFileObject(k);
  });

  // Get translation
  Object.assign(result, await this.translate(locale));

  return result;
};

Model.prototype.translate = async function (locale) {
  const translationsList = `${this.list.key}Translation`;
  let translationsRelationship = Object.keys(this.list.relationships)
    .filter(k => this.list.relationships[k].ref === translationsList)
    .pop();

  // Resolve empty object if no translation list
  if (!translationsRelationship) return {};

  translationsRelationship = this.list.relationships[translationsRelationship];

  // Get translation
  const translation = await keystone.list(translationsList).model.findOne({
    locale,
    [translationsRelationship.refPath]: this,
  }).exec();

  // Return only API fields
  return _.pick(translation, ...this.getApiFields());
};

// Enable native promises for mongoose.Promise
mongoose.Promise = Promise;

module.exports = mongoose;
