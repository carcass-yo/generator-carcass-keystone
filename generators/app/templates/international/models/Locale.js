const keystone = require('keystone');
const findOrCreate = require('mongoose-findorcreate');

const { Types } = keystone.Field;

const Locale = new keystone.List('Locale', {
  nocreate: true,
  nodelete: true,
});


/**
 * Define model fields
 */
Locale.add({
  name: {
    label: 'Язык',
    type: Types.Text,
    required: true,
    initial: true,
    index: true,
  },
  code: {
    label: 'Код языка',
    type: Types.Text,
    required: true,
    initial: true,
    index: true,
    note: 'Код языка, соответствующий стандарту BCP47',
    noedit: true,
  },
});


/**
 * Define schema plugins
 */
Locale.schema.plugin(findOrCreate);


/**
 * Define model relations
 */
Locale.relationship({
  ref: 'PageTranslation',
  path: 'page-translations',
  refPath: 'locale',
});

Locale.navSection = 'system';
Locale.defaultColumns = 'name, code';
Locale.register();


/**
 * Register supported languages
 */
const supportedLangs = keystone.get('language options')['supported languages'];
Promise.all(supportedLangs.map(code => Locale.model.findOrCreate({ code }, { name: code })));

<% if (rest) { %>
/**
 * @swagger
 * definitions:
 *   Locale:
 *     type: 'object'
 *     properties:
 *       _id:
 *         type: 'string'
 *       name:
 *         type: 'string'
 *       code:
 *         type: 'string'
 *         format: 'bcp47'
 */
<% } %>
