const { ObjectId } = require('mongoose').Types;

module.exports = class BaseTransport {
  constructor(message) {
    this.message = message;
  }

  async getRecipients() {
    const recipientsIds = this.message.to
      .map(id => (id instanceof ObjectId ? String(id) : String(id._id)));
    const recipientsList = this.message.list.fields.to.refList;
    return recipientsList.model.find().where({ _id: { $in: recipientsIds } }).exec();
  }
};
