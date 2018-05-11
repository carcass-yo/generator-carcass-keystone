/**
 * Custom error handler
 */
const keystone = require('keystone');
const AuthenticationError = require('passport/lib/errors/authenticationerror');

const { SIGN_IN_ERROR } = keystone.get('errors');

module.exports = () => {
  keystone.set('500', (err, req, res) => {
    let error = err;

    // Switch Passport.js AuthenticationError to SIGN_IN_ERROR
    if (err instanceof AuthenticationError) {
      error = new SIGN_IN_ERROR(req.session.messages[0], 401);
    }

    const key = error.constructor.name;
    const msg = error.message;
    let { code } = error;
    if (!Number.isInteger(code) || code > 505) {
      code = 500;
    }

    return res.apiError(key, msg, error, code);
  });
};
<% if (rest) { %>
/**
 * @swagger
 * definitions:
 *   ErrorResponse:
 *     type: 'object'
 *     properties:
 *       error:
 *         type: 'string'
 *         description: 'Код ошибки'
 *         enum:
 *         - 'AppError'
 *         - 'BAD_REQUEST'
 *         - 'CREATE_ERROR'
 *         - 'DELETE_ERROR'
 *         - 'FORGOT_PASSWORD_ERROR'
 *         - 'NOT_AUTH'
 *         - 'NOT_FOUND'
 *         - 'RESET_PASSWORD_ERROR'
 *         - 'SIGN_IN_ERROR'
 *         - 'UPDATE_ERROR'
 *       detail:
 *         type: 'string'
 *         description: 'Подробное сообщение ошибки'
 */
<% } %>
