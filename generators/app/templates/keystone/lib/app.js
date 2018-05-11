const keystone = require('keystone');
const _ = require('underscore');
const path = require('path');
const mongoose = require('./mongoose');

/** Initialise Keystone with project's configuration */
keystone.init({
  mongoose,
  name: 'Энерго-Сервис-Строй',
  brand: '545-1-DEV',
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost/545-1-DEV',
  static: 'public',
  favicon: 'public/favicon.png',
  views: 'templates/views',
  emails: 'templates/emails',
  session: true,
  auth: true,
  'module root': path.resolve(__dirname, '..'),
  'view engine': 'pug',
  'session store': 'mongo',
  'user model': 'User',
  'default region': 'ru',
  'wysiwyg additional buttons': [
    'restoredraft',
    'emoticons',
  ].join(),
  'wysiwyg additional plugins': [
    'autosave',
    'emoticons',
  ].join(),
  'auto update': true,
  'language options': {
    'supported languages': [
      'ru',
      'en',
    ],
    'language select url': '/api/v1/Locale/{language}/setLocale',
  },
  'trust proxy': true,
});

/** Extend keystone utils module with custom util functions */
Object.assign(keystone.utils, keystone.importer(__dirname)('./utils'));

require('./createLoggers')<% if (international) { %>
require('./translations');<% } %>

/** Set locals for pug templates */
keystone.set('locals', {
  _,
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
  name: keystone.get('name'),
  brand: keystone.get('brand'),<% if (international) { %>
  gt: keystone.get('gettext'),<% } %>
});

/** Import Errors Classes */
keystone.set('errors', keystone.importer(__dirname)('./errors'));

/** Import Storages */
keystone.set('storage', keystone.importer(__dirname)('./storage'));

/** Import Mongoose General Hooks */
keystone.set('hooks', keystone.importer(__dirname)('./hooks'));

/** Import Middlewares */
keystone.set('middleware', keystone.importer(__dirname)('./middleware'));<% if (passport) { %>

/** Import Passport.js strategies */
keystone.set('passport', keystone.importer(__dirname)('./passport'));<% } %><% if (nodemailer) { %>

/** Import SystemMessage transports */
keystone.set('transports', keystone.importer(__dirname)('./transports'));<% } %>

/** Load models and keystone admin navigation */
require('../models');
require('./nav');

/** Enable CORS and API middleware */
keystone.pre('routes', keystone.get('middleware').cors);
keystone.pre('static', keystone.get('middleware').cors);
keystone.pre('routes', keystone.get('middleware').api);

keystone.set('routes', (app) => {
  // eslint-disable-next-line global-require
  require('../controllers').forEach(c => c(app));
});

module.exports = keystone;
