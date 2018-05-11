/* eslint-disable global-require */
module.exports = [<% if (passport) { %>
  // Passport
  require('./PassportInit'),<% } %><% if (international) { %>

  // Locale
  require('./LocaleController'),<% } %><% if (rest) { %>

  // API
  ...require('./v1'),<% } %>
  require('./ErrorHandlerController'),

  // Redirects
  require('./SigninRedirect'),

  // Views
  require('./AppView'),
];
