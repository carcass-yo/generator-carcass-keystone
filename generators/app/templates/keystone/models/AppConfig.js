const keystone = require('keystone');

const { Types } = keystone.Field;

const AppConfig = new keystone.List('AppConfig', { nocreate: true, nodelete: true });


/**
 * Define model fields
 */
AppConfig.add('Заголовок страницы');
AppConfig.add({
  TITLE_POSTFIX: {
    label: 'Постфикс заголовка',
    type: Types.Text,
  },
  TITLE_SEP: {
    label: 'Разделитель заголовка',
    type: Types.Text,
  },
});

AppConfig.add('Яндекс Метрика');
AppConfig.add({
  YA_METRIKA_CONF: {
    label: 'Конфиг (JSON)',
    type: Types.Textarea,
  },
});


/**
 * Define schema hooks
 */
AppConfig.schema.pre('save', function validateMetrikaConfig(next) {
  if (!this.YA_METRIKA_CONF) return next();

  try {
    // eslint-disable-next-line no-unused-vars
    const test = JSON.parse(this.YA_METRIKA_CONF);
    return next();
  } catch (e) {
    return next(new Error('Невалидный JSON конфиг для Яндекс Метрики'));
  }
});


/**
 * Define schema methods
 */

AppConfig.schema.methods.normalize = function appConfigNormalize() {
  const copy = JSON.parse(JSON.stringify(this));
  copy.YA_METRIKA_CONF = JSON.parse(copy.YA_METRIKA_CONF);
  delete copy._id;
  delete copy.__v;
  return copy;
};

AppConfig.navSection = 'system';
AppConfig.register();
