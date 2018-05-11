process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://mongo:27017/test';
process.env.PORT = process.env.TEST_PORT || '5000';
process.env.ENVIRONMENT = 'test';

const keystone = require('./lib/app');

keystone.set('logger', false);

module.exports = async () => {
  global.__keystone__ = await new Promise(resolve => keystone.start({
    onStart: () => resolve(keystone),
  }));
};
