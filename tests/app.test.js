const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-carcass-base', () => {
  beforeAll(() => helpers.run(path.join(__dirname, '../generators/app')).toPromise(), 15000);

  it('creates base project files', () => {
    assert.file([
      'controllers/AppView.js',
      'controllers/ErrorHandlerController.js',
      'controllers/index.js',
      'controllers/SigninRedirect.js',
      'lib/errors/AppError.js',
      'lib/errors/BAD_REQUEST.js',
      'lib/errors/CREATE_ERROR.js',
      'lib/errors/DELETE_ERROR.js',
      'lib/errors/FORGOT_PASSWORD_ERROR.js',
      'lib/errors/NOT_AUTH.js',
      'lib/errors/NOT_FOUND.js',
      'lib/errors/RESET_PASSWORD_ERROR.js',
      'lib/errors/SIGN_IN_ERROR.js',
      'lib/errors/UPDATE_ERROR.js',
      'lib/hooks/wasNew.js',
      'lib/middleware/api.js',
      'lib/middleware/cors.js',
      'lib/middleware/requireAdminApi.js',
      'lib/middleware/requireAdminRedirect.js',
      'lib/middleware/requireUserApi.js',
      'lib/middleware/requireUserRedirect.js',
      'lib/storage/uploadStorage.js',
      'lib/utils/clearPhone.js',
      'lib/utils/googleLookup.js',
      'lib/utils/resizeImage.js',
      'lib/app.js',
      'lib/createLoggers.js',
      'lib/mongoose.js',
      'lib/nav.js',
      'logs/.gitkeep',
      'models/AppConfig.js',
      'models/File.js',
      'models/ForgotPassword.js',
      'models/index.js',
      'models/Locale.js',
      'models/Page.js',
      'models/PageTranslation.js',
      'models/User.js',
      'templates/layouts/default.pug',
      'templates/mixins/flash-messages.pug',
      'templates/views/index.pug',
      'updates/0.0.1-admins.js',
      'updates/0.0.2-demo-users.js',
      'updates/0.0.3-app-config.js',
      'ecosystem.config.js',
      'index.js',
    ]);
  });

  it('should add keystone to dependencies', () => {
    assert.fileContent([
      ['package.json', /keystone/],
    ]);
  });
});
