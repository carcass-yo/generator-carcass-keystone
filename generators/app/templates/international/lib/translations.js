/* eslint-disable global-require,import/no-dynamic-require */
/**
 * Implement gettext support
 */

const keystone = require('keystone');
const fs = require('fs');
const path = require('path');
const Gettext = require('node-gettext');
const parser = require('gettext-parser');

const domain = 'tok';
const gt = new Gettext();
gt.setTextDomain(domain);

// Get languages from dir
const supportedLangs = keystone.get('language options')['supported languages'];
const languagesDir = path.resolve(keystone.get('module root'), 'languages');
const languages = fs.readdirSync(languagesDir)
  .filter(l => ['.po', '.json'].includes(path.extname(l)))
  .filter(l => supportedLangs.includes(path.basename(l, path.extname(l))));

// Parse translations
languages.forEach((lang) => {
  const locale = path.basename(lang, path.extname(lang));
  const fullPath = path.resolve(languagesDir, lang);

  const translation = path.extname(lang) === '.json' ?
    require(fullPath) :
    parser.po.parse(fs.readFileSync(fullPath));

  gt.addTranslations(locale, domain, translation);
});

keystone.set('gettext', gt);
