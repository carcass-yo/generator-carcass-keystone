/**
 * Group models to categories by implication and set admin app navigation
 */
const keystone = require('keystone');

const nav = {};

Object.keys(keystone.lists).forEach((key) => {
  const section = keystone.lists[key].navSection;
  if (!section) return;

  if (!nav[section]) nav[section] = [];
  nav[section].push(key);
});

keystone.set('nav', nav);
