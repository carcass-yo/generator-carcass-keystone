const request = require('supertest');

const LOGIN_ROUTE = '/api/v1/User/login';
const LOGOUT_ROUTE = '/api/v1/User/logout';
const USER_MODEL = require('./UserModel');

const KEYSTONE_SESSION_KEY = expect.stringContaining('keystone.uid');
const PASSPORT_SESSION_KEY = expect.stringContaining('this.sid');

describe('User Authentication Controller', () => {
  describe(`${LOGIN_ROUTE} hook`, () => {
    test('it should throws error without credentials passed', () =>
      request(global.__keystone__.httpServer)
        .post(LOGIN_ROUTE)
        .then((res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('SIGN_IN_ERROR');
        }));

    test('it should throws error with wrong password', () =>
      request(global.__keystone__.httpServer)
        .post(LOGIN_ROUTE)
        .send({ login: '1119@zolotoykod.ru', password: 'wrong-password' })
        .then((res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('SIGN_IN_ERROR');
        }));

    test('it should throws error with wrong login', () =>
      request(global.__keystone__.httpServer)
        .post(LOGIN_ROUTE)
        .send({ login: 'no-user@found.xyz', password: 'wrong-password' })
        .then((res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('SIGN_IN_ERROR');
        }));

    test('it should log in with email and valid password', () =>
      request(global.__keystone__.httpServer)
        .post(LOGIN_ROUTE)
        .send({ login: '1119@zolotoykod.ru', password: 'testtesttest' })
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(USER_MODEL);
        }));

    test('it should log in with phone and valid password', () =>
      request(global.__keystone__.httpServer)
        .post(LOGIN_ROUTE)
        .send({ login: '+7 (999) 000 00 00', password: 'testtesttest' })
        .then((res) => {
          expect(res.status).toEqual(200);
          const cookies = res.headers['set-cookie'];
          expect(cookies).toContainEqual(KEYSTONE_SESSION_KEY);
          expect(cookies).toContainEqual(PASSPORT_SESSION_KEY);
          expect(res.body).toEqual(USER_MODEL);
        }));
  });

  describe(`${LOGOUT_ROUTE} hook`, () => {
    test('it should log out user and respond with null', () =>
      request(global.__keystone__.httpServer)
        .get(LOGOUT_ROUTE)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(null);
        }));
  });
});
