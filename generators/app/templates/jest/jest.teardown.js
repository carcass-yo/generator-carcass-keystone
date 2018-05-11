module.exports = () => new Promise((resolve) => {
  console.log('Teardown');
  // TODO: clean database
  resolve();
});
