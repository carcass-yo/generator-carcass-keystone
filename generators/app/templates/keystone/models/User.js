const keystone = require('keystone');

const { Types } = keystone.Field;

const User = new keystone.List('User', { track: true });


/**
 * Define model fields
 */
User.add({
  name: {
    label: 'Имя',
    type: Types.Name,
    initial: true,
    required: true,
    index: true,
  },
  email: {
    label: 'E-mail',
    type: Types.Email,
    initial: true,
    required: true,
    index: true,
  },
  password: {
    label: 'Пароль',
    type: Types.Password,
    initial: true,
    required: true,
  },
  isAdmin: {
    label: 'Администратор',
    type: Types.Boolean,
    index: true,
    note: 'Глобальный администраторский доступ',
  },
  phone: {
    label: 'Телефон',
    type: Types.Text,
    initial: true,
    index: true,
  },
  avatar: {
    label: 'Аватар',
    type: Types.Relationship,
    ref: 'File',
    initial: true,
    index: true,
  },<% if (passport) { %>
  vkontakteId: {
    label: 'ID Вконтакте',
    type: Types.Text,
    index: true,
  },
  facebookId: {
    label: 'ID Facebook',
    type: Types.Text,
    index: true,
  },<% } %>
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
  return this.isAdmin;
});


/**
 * Define schema hooks
 */
User.schema.pre('save', keystone.get('hooks').wasNew);

User.schema.pre('save', function (next) {
  this.phone = keystone.utils.clearPhone(this.phone);
  next();
});

/**
 * Define model relations
 */
User.relationship({
  ref: 'ForgotPassword',
  path: 'forgot-passwords',
  refPath: 'user',
});

User.apiFields = [
  '_id',
  'name',
  'email',
  'isAdmin',
  'phone',
  'type',
  'avatar',
];
User.navSection = 'users';
User.defaultColumns = [
  'name',
  'email',
  'isAdmin',
  'phone',
  'type',
].join(',');
User.register();
<% if (rest) { %>
/**
 * @swagger
 * definitions:
 *   User:
 *     type: 'object'
 *     properties:
 *       _id:
 *         type: 'string'
 *       name:
 *         type: 'object'
 *         properties:
 *           first:
 *             type: 'string'
 *           last:
 *             type: 'string'
 *       email:
 *         type: 'string'
 *         format: 'email'
 *       phone:
 *         type: 'string'
 *       password:
 *         type: 'string'
 *         format: 'password'
 *       isAdmin:
 *         type: 'boolean'
 *       avatar:
 *         $ref: '#/definitions/File'
 */
<% } %>
