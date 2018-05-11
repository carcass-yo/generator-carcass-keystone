const Carcass = require('carcass-generator');
const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');

class CarcassGeneratorKeystone extends Carcass {
  /**
   * Keystone.js generator
   * @param {String|Array} args
   * @param {Object} opts
   */
  constructor(args, opts) {
    super(args, opts);

    const checkOption = name => !_.isNil(this.options[name]);

    this.questionsList = [
      {
        name: 'appname',
        when: () => !checkOption('appname'),
        type: 'input',
        message: 'Enter your app name',
        default: this.appname,
      },
      {
        name: 'authorName',
        when: () => !checkOption('authorName'),
        type: 'input',
        message: 'Enter your name',
        default: this.user.git.name(),
      },
      {
        name: 'authorEmail',
        when: () => !checkOption('authorEmail'),
        type: 'input',
        message: 'Enter your email',
        default: this.user.git.email(),
      },
      {
        name: 'devDomain',
        when: () => !checkOption('devDomain'),
        type: 'input',
        message: 'Enter development domain name',
        default: `${this.appname}.local`,
      },
      {
        name: 'docker',
        when: () => !checkOption('docker'),
        type: 'confirm',
        message: 'I will use Docker in my project',
      },
      {
        name: 'jest',
        when: () => !checkOption('jest'),
        type: 'confirm',
        message: 'I will use Jest for unit-testing',
      },
      {
        name: 'rest',
        when: () => !checkOption('rest'),
        type: 'confirm',
        message: 'I going to develop REST API',
      },
      {
        name: 'passport',
        when: answers => answers.rest && !checkOption('passport'),
        type: 'confirm',
        message: 'I will use Passport.js for users auth',
      },
      {
        name: 'nodemailer',
        when: () => !checkOption('nodemailer'),
        type: 'confirm',
        message: 'I going to send mails through SMTP',
      },
      {
        name: 'international',
        when: () => !checkOption('international'),
        type: 'confirm',
        message: 'I going to develop international service',
      },
    ];

    this.options.dirname = path.basename(this.destinationPath());
    this.options.gitOrigin = Carcass.getGitOrigin('#ENTER_YOUR_GIT_REPO_HERE#');
    this.options.cookieSecret = crypto.randomBytes(64).toString('hex');
    this.convertPromptsToOptions(this.questionsList);
  }

  async prompting() {
    const answers = await this.prompt(this.questionsList);
    Object.assign(this.options, answers);
    this.options.appnameSlug = Carcass.slugify(this.options.appname);

    this.composeWith(require.resolve('generator-carcass-base/generators/app'), {
      appname: this.options.appname,
      authorName: this.options.authorName,
      authorEmail: this.options.authorEmail,
      docker: this.options.docker,
      eslint: true,
      dotenv: true,
    });
  }

  writing() {
    const pkg = {
      dependencies: {
        async: '^2.3.0',
        'bcrypt-nodejs': '0.0.3',
        bunyan: '^1.8.1',
        'connect-mongo': '^1.3.2',
        cors: '^2.8.3',
        faker: '^4.1.0',
        gm: '^1.23.0',
        keystone: '4.0.0-beta.5',
        moment: '^2.14.1',
        mongoose: '^5.0.9',
        'mongoose-findorcreate': '^3.0.0',
        'mongoose-search-plugin': '^0.1.2',
        pug: '2.0.0-rc.4',
        request: '^2.85.0',
        'request-promise-native': '^1.0.5',
        underscore: '^1.8.3',
        xss: '^0.3.4',
        yargs: '^8.0.2',
      },
      devDependencies: {},
      scripts: {
        start: 'node index.js',
        log: 'bunyan',
      },
    };

    this.fs.copyTpl(
      this.templatePath('keystone'),
      this.destinationPath('.'),
      this.options,
      {},
      { globOptions: { dot: true } },
    );

    /**
     * Enable Docker support
     */
    if (this.options.docker) {
      this.fs.copyTpl(
        this.templatePath('docker'),
        this.destinationPath('.'),
        this.options,
        {},
        { globOptions: { dot: true } },
      );

      // Write .env variables
      this.fs.append(
        this.destinationPath('.env'),
        [
          `COOKIE_SECRET=${this.options.cookieSecret}`,
          `DOMAIN=${this.options.devDomain}`,
          `VIRTUAL_HOST=${this.options.devDomain}`,
          'VIRTUAL_PORT=3000',
        ].join('\n'),
      );
    }

    /**
     * Enable support for Jest unit tests
     */
    if (this.options.jest) {
      _.merge(pkg, {
        devDependencies: {
          jest: '^22.4.2',
          'jest-environment-node': '^22.4.3',
          supertest: '^3.0.0',
        },
        scripts: {
          test: 'jest --forceExit --runInBand ./tests/*',
        },
      });
    }

    /**
     * Enable support for REST API
     */
    if (this.options.rest) {
      // Add passport.js dependencies
      _.merge(pkg, {
        dependencies: {
          'express-restify-mongoose': '^4.1.3',
          'swagger-jsdoc': '^1.9.7',
          'swagger-ui-express': '^2.0.15',
        },
      });

      // Write template
      this.fs.copyTpl(
        this.templatePath('rest'),
        this.destinationPath('.'),
        this.options,
        {},
        { globOptions: { dot: true } },
      );
    }

    /**
     * Enable support for Passport.js auth strategies
     */
    if (this.options.passport) {
      // Add passport.js dependencies
      _.merge(pkg, {
        dependencies: {
          passport: '^0.4.0',
          'passport-facebook': '^2.1.1',
          'passport-local': '^1.0.0',
          'passport-vkontakte': '^0.3.2',
        },
      });

      // Write template
      this.fs.copyTpl(
        this.templatePath('passport'),
        this.destinationPath('.'),
        this.options,
        {},
        { globOptions: { dot: true } },
      );

      // Write .env variables
      this.fs.append(
        this.destinationPath('.env'),
        [
          'FACEBOOK_APP_ID=PUT YOUR APP ID HERE',
          'FACEBOOK_APP_SECRET=PUT YOUR APP SECRET HERE',
          'VKONTAKTE_APP_ID=PUT YOUR APP ID HERE',
          'VKONTAKTE_APP_SECRET=PUT YOUR APP SECRET HERE',
        ].join('\n'),
      );
    }

    /**
     * Enable support for Mail service
     */
    if (this.options.nodemailer) {
      // Add dependencies
      _.merge(pkg, {
        dependencies: {
          'keystone-email': 'https://github.com/miaowing/keystone-email.git#0922f6fbd94e94369299736eb7700dd6a6a1ce59',
          nodemailer: '^4.4.0',
        },
      });

      // Write template
      this.fs.copyTpl(
        this.templatePath('nodemailer'),
        this.destinationPath('.'),
        this.options,
        {},
        { globOptions: { dot: true } },
      );

      // Write .env variables
      this.fs.append(
        this.destinationPath('.env'),
        [
          'NODEMAILER_SMTP_HOST=mail.zolotoykod.ru',
          'NODEMAILER_SMTP_PORT=25',
          'NODEMAILER_SENDER_EMAIL=noreply@tok.local',
        ].join('\n'),
      );
    }

    /**
     * Enable support for international
     */
    if (this.options.international) {
      _.merge(pkg, {
        dependencies: {
          'gettext-parser': '^1.3.1',
          'node-gettext': '^2.0.0',
        },
        devDependencies: {
          jsxgettext: '^0.10.2',
        },
        scripts: {
          xgettext: 'jsxgettext -L jade -o languages/<%=appnameSlug%>.pot templates/views/*.pug',
        },
      });

      this.fs.copyTpl(
        this.templatePath('international'),
        this.destinationPath('.'),
        this.options,
        {},
        { globOptions: { dot: true } },
      );
    }

    // Write package.json
    this.fs.extendJSON(this.destinationPath('package.json'), pkg);
  }
}

module.exports = CarcassGeneratorKeystone;
