const keystone = require('keystone');

const { Types } = keystone.Field;

const PageTranslation = new keystone.List('PageTranslation');


/**
 * Define model fields
 */
PageTranslation.add({
  page: {
    label: 'Page',
    type: Types.Relationship,
    ref: 'Page',
    required: true,
    initial: true,
    index: true,
  },
  locale: {
    label: 'Локаль перевода',
    type: Types.Relationship,
    ref: 'Locale',
    required: true,
    initial: true,
    index: true,
  },
  name: {
    label: 'Заголовок',
    type: Types.Text,
    required: true,
    initial: true,
  },
  content: {
    label: 'Полный текст',
    type: Types.Html,
    wysiwyg: false,
    height: 400,
  },
  seo: {
    title: {
      label: 'SEO Title',
      type: Types.Text,
    },
    keywords: {
      label: 'Ключевые слова',
      type: Types.Text,
    },
    description: {
      label: 'Описание для сниппета',
      type: Types.Textarea,
    },
  },
});


PageTranslation.navSection = 'grain';
PageTranslation.defaultColumns = 'name, locale, grain';
PageTranslation.register();
