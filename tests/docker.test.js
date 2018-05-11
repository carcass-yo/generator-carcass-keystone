const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('docker', () => {
  const generator = () => helpers.run(path.join(__dirname, '../generators/app'));
  const testFiles = () => assert.file([
    'docker-compose.override.yml',
    'docker-compose.prod.yml',
    'docker-compose.yml',
    'Dockerfile',
    'Dockerfile-prod',
  ]);

  const testEnv = () => assert.fileContent([
    ['.env', /COOKIE_SECRET=/],
    ['.env', /DOMAIN=/],
    ['.env', /VIRTUAL_HOST=/],
    ['.env', /VIRTUAL_PORT=/],
  ]);

  describe('with options', () => {
    beforeAll(() => generator().withOptions({ docker: true }).toPromise(), 15000);
    it('creates Dockerfiles and Compose configs', testFiles);
    it('write options to .env file', testEnv);
  });

  describe('with prompts', () => {
    beforeAll(() => generator().withPrompts({ docker: true }).toPromise(), 15000);
    it('creates Dockerfiles and Compose configs', testFiles);
    it('write options to .env file', testEnv);
  });
});
