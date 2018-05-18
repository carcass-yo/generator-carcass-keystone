// Load app models in order to relationships between them
require('./AppConfig');<% if (international) { %>
require('./Locale');<% } %>
require('./File');
require('./User');
require('./ForgotPassword');<% if (nodemailer) { %>
require('./SystemMessage');<% } %>
require('./Page');<% if (international) { %>
require('./PageTranslation');<% } %>
