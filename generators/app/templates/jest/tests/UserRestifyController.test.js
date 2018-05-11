const request = require('supertest');
const USER_MODEL = require('./UserModel');

const API_ROUTE = '/api/v1/User';

let agent;
let userCreated;
const userData = {
  name: {
    first: 'Test',
    last: 'Test',
  },
  email: 'test@test.test',
  phone: '+7 (123) 123 00 - 00',
  password: 'test',
};

describe('User REST API', () => {
  beforeAll(() => {
    agent = request.agent(global.__keystone__.httpServer);
  });

  test('it should create user', () =>
    agent
      .post(API_ROUTE)
      .send(userData)
      .withCredentials()
      .then((res) => {
        userCreated = res.body;
        expect(res.status).toBe(201);
        expect(res.body).toEqual(USER_MODEL);
      }));

  test('it should get current user', () =>
    agent
      .get(API_ROUTE)
      .withCredentials()
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(USER_MODEL);
      }));

  test('it should get user by ID', () =>
    agent
      .get(`${API_ROUTE}/${userCreated._id}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(USER_MODEL);
      }));

  test('it should update user', () =>
    agent
      .patch(`${API_ROUTE}/${userCreated._id}`)
      .send({ name: { first: 'Test 1' } })
      .withCredentials()
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(USER_MODEL);
        expect(res.body.name.first).toBe('Test 1');
      }));

  test('it should delete user', () =>
    agent
      .delete(`${API_ROUTE}/${userCreated._id}`)
      .withCredentials()
      .then((res) => {
        expect(res.status).toBe(204);
      }));
});
