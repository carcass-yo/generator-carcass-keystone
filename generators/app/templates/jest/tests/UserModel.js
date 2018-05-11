module.exports = expect.objectContaining({
  _id: expect.any(String),
  name: {
    first: expect.any(String),
    last: expect.any(String),
  },
  email: expect.any(String),
  isAdmin: expect.any(Boolean),
  phone: expect.any(String),
  type: expect.any(String),
});
