/* eslint-disable global-require */
module.exports = [<% if (passport) { %>
  require('./UserAuthController').controller,<% } %>
  require('./UserRestifyController'),
  require('./UserForgotPasswordController'),
  require('./LocaleRestifyController'),
  require('./FileRestifyController'),
  require('./SwaggerGeneratorController'),
];
