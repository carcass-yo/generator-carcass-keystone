/**
 * Render Angular app for all public pages
 */
const keystone = require('keystone');

const router = keystone.createRouter();

router.get('/*', (req, res) => {
  const view = new keystone.View(req, res);
  view.query('config', keystone.list('AppConfig').model.findOne());
  view.render('index');
});

module.exports = (app) => {
  app.use('/', router);
};
