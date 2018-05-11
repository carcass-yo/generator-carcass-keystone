const faker = require('faker');
const { utils } = require('keystone');

faker.locale = 'ru';

const fakeUser = () => {
  const gender = faker.random.number(1);
  const firstName = faker.name.firstName(gender);
  const lastName = faker.name.lastName(gender);

  return {
    name: {
      first: firstName,
      last: lastName,
    },
    email: faker.internet.email(
      utils.transliterate(firstName),
      utils.transliterate(lastName),
    ),
    password: 'demopwd123',
    phone: `7${faker.phone.phoneNumber()}`,
  };
};

exports.create = {
  User: [
    fakeUser(),
    fakeUser(),
    fakeUser(),
    fakeUser(),
    fakeUser(),
  ],
};
