const keystone = require('keystone');

const { Types } = keystone.Field;
const { FORGOT_PASSWORD_ERROR } = keystone.get('errors');
const gt = keystone.get('gettext');

const ForgotPassword = new keystone.List('ForgotPassword', {
  nocreate: true,
  noedit: true,
  track: true,
});

ForgotPassword.schema.pre('save', keystone.get('hooks').wasNew);

ForgotPassword.schema.pre('save', function generatePassword(next) {
  if (this.isNew) {
    this.password = keystone.utils.randomString();
    this.cleanPassword = this.password;
  }
  return next();
});

/**
 * Define model fields
 */
ForgotPassword.add({
  user: {
    label: 'Пользователь',
    type: Types.Relationship,
    ref: 'User',
    index: true,
    required: true,
    initial: true,
  },
  password: {
    label: 'Пароль',
    type: Types.Password,
    initial: true,
  },
});

ForgotPassword.schema.post('save', async function () {
  if (!this.wasNew) return false;

  const text = `${gt.gettext('Ваш новый пароль')}: ${this.cleanPassword}`;

  const SystemMessage = keystone.list('SystemMessage').model;
  const message = new SystemMessage({
    text,
    transport: 'twilio',
    to: [this.user],
    subject: 'Восстановление пароля',
  });

  return message.save();
});


/**
 * Define model methods
 */

ForgotPassword.schema.methods.check = async function (candidate) {
  await (async () =>
    new Promise((resolve, reject) =>
      this._.password.compare(candidate, (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new FORGOT_PASSWORD_ERROR(gt.gettext('Введен не верный пароль')));
        return resolve(result);
      }))
  )();

  const doc = await this.populate('user').execPopulate();
  const { user } = doc;
  user.password = candidate;
  return user.save();
};

ForgotPassword.apiFields = ['_id'];
ForgotPassword.navSection = 'users';
ForgotPassword.defaultSort = '-createdAt';
ForgotPassword.defaultColumns = 'user, createdAt';
ForgotPassword.register();
