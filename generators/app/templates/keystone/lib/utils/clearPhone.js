/**
 * Clear phone number string of special chars
 * @param {String} input
 * @return {String}
 */
module.exports = (input) => {
  const matches = input.match(/\d+/g);
  if (!matches) return input;
  return matches.join('');
};
