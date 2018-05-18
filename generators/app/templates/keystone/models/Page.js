const keystone = require('keystone');

const { Types } = keystone.Field;

const Page = new keystone.List('Page');


/**
 * Define model fields
 */
Page.add({
  name: {
    label: 'Заголовок',
    type: Types.Text,
    required: true,
    initial: true,
  },
  code: {
    label: 'Символьный код',
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
<% if (international) { %>
Page.relationship({
  ref: 'PageTranslation',
  path: 'page-translations',
  refPath: 'page',
});
<% } %>
Page.navSection = 'cms';
Page.defaultColumns = 'name, code';
Page.register();
