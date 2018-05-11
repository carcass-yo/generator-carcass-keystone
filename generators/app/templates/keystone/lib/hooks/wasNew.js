module.exports = function wasNew(next) {
  this.wasNew = this.isNew;
  next();
};
