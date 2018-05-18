const keystone = require('keystone');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    info: {
      version: '1.0.0',
      title: keystone.get('name'),
    },
    schemes: [
      'http',
      'https',
    ],
    host: (process.env.DOMAIN || 'localhost').split(',').filter(a => !!a)[0],
    basePath: '/api/v1',
  },
  apis: [
    path.resolve(keystone.get('module root'), 'controllers', 'v1', '*.js'),
    path.resolve(keystone.get('module root'), 'controllers', 'ErrorHandlerController.js'),
    path.resolve(keystone.get('module root'), 'lib', 'restifyConfig.js'),
    path.resolve(keystone.get('module root'), 'models', '*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  const router = keystone.createRouter();
  // router.use(keystone.middleware.api);

  // Serve swagger.json config
  router.get('/api/v1/swagger.json', (q, res) => res.apiResponse(swaggerSpec));

  // Serve swagger ui, that requires admin access in production
  router.use(
    '/api-docs',
    (req, res, next) => {
      if (keystone.get('env').toLowerCase() === 'production') {
        return keystone.get('middleware').requireAdminRedirect(req, res, next);
      }

      return next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );

  app.use('/', router);
};
