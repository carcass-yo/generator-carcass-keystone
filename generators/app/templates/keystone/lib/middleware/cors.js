// TODO: disable asterisk origin on production env
module.exports = require('cors')({
  origin: true,
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  credentials: true,
});
