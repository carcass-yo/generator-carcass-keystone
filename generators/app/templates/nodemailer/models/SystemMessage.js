const keystone = require('keystone');
const fs = require('fs');
const path = require('path');

const { Types } = keystone.Field;
const transports = keystone.get('transports');
const logger = keystone.get('logs').mail;

const SystemMessage = new keystone.List('SystemMessage', {
  nocreate: true,
  noedit: true,
  track: true,
});

const templatesPath = path.resolve(keystone.get('module root'), 'templates', 'emails');
const availableTemplates = fs.readdirSync(templatesPath)
  .filter(t => !t.startsWith('.'))
  .map(t => path.basename(t, path.extname(t)));

/**
 * Define model fields
 */
SystemMessage.add({
  transport: {
    label: 'Метод отправки сообщения',
    type: Types.Select,
    options: Object.keys(transports).filter(t => t !== 'base'),
    default: 'email',
    required: true,
    index: true,
    initial: true,
  },
  from: {
    label: 'Отправитель',
    type: Types.Text,
    initial: true,
    dependsOn: {
      transport: 'email',
    },
  },
  to: {
    label: 'Получатели',
    type: Types.Relationship,
    ref: 'User',
    many: true,
    index: true,
    required: true,
    initial: true,
  },
  subject: {
    label: 'Тема письма',
    type: Types.Text,
    required: true,
    initial: true,
  },
  text: {
    label: 'Сообщение',
    type: Types.Html,
    wysiwyg: true,
    required: true,
    initial: true,
  },
  template: {
    label: 'Шаблон',
    type: Types.Select,
    options: availableTemplates,
    index: true,
    initial: true,
    dependsOn: {
      transport: 'email',
    },
  },
});


/**
 * Define schema hooks
 */
SystemMessage.schema.pre('save', keystone.get('hooks').wasNew);

SystemMessage.schema.post('save', function () {
  if (this.wasNew) this.send();
});


/**
 * Define model methods
 */

SystemMessage.schema.methods.send = async function () {
  const Transport = transports[this.transport];
  try {
    const sm = new Transport(this);
    await sm.send();
  } catch (e) {
    logger.error(e, `Cannot send message ${this._id} with transport ${this.transport}`);
  }
};

SystemMessage.navSection = 'enquiries';
SystemMessage.defaultSort = '-createdAt';
SystemMessage.defaultColumns = 'subject, to, transport, createdAt';
SystemMessage.register();
