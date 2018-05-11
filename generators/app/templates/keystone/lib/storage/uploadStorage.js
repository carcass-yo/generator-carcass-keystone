/**
 * Upload storage for local file storing
 */
const keystone = require('keystone');
const path = require('path');

module.exports = new keystone.Storage({
  adapter: keystone.Storage.Adapters.FS,
  fs: {
    path: path.resolve(
      keystone.get('module root'),
      keystone.get('static'),
      'uploads',
    ),
    publicPath: '/uploads/',
  },
});
