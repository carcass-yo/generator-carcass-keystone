const keystone = require('keystone');

module.exports = (app) => {
  app.use('/', async (req, res, next) => {
    if (!req.cookies.locale || !req.cookies.locale.startsWith(req.language)) {
      const locale = await keystone.list('Locale').model.findOne({ code: req.language }).exec();
      req.cookies.locale = `${req.language}:${locale._id}`;
      res.cookie('locale', req.cookies.locale, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    }

    req.locale = req.cookies.locale.split(':').pop();
    keystone.get('gettext').setLocale(req.language);
    next();
  });
};
