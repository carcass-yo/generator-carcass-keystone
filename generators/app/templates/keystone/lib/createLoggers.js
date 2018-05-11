/**
 * Create bunyan loggers
 */
const keystone = require('keystone');
const bunyan = require('bunyan');
const path = require('path');

const logsDir = path.resolve(keystone.get('module root'), 'logs');
const createLog = name =>
  bunyan.createLogger({
    name,
    streams: [
      {
        level: 'info',
        path: `${logsDir}/${name}.log`,
      },
    ],
  });

const logs = {};
[
  'mail',
].forEach((name) => { logs[name] = createLog(name); });

keystone.set('logs', logs);
