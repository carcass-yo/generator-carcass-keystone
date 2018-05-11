/* eslint-disable import/no-extraneous-dependencies */
const NodeEnvironment = require('jest-environment-node');

class KeystoneEnvironment extends NodeEnvironment {
  async setup() {
    this.global.__keystone__ = global.__keystone__;
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = KeystoneEnvironment;
