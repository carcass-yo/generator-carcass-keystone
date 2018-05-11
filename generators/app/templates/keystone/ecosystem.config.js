let { ENVIRONMENT, DEBUG_APP, WATCH } = process.env;

if (!ENVIRONMENT) ENVIRONMENT = 'development';

/**
 * Define our Apps array
 * @type {Array<any>}
 */
let APPS = [
  {
    name: 'main',
    script: 'index.js',
  },
];

const defaults = {};
const ENV_OPTIONS = {
  /** Define dev env options */
  development: Object.assign({}, WATCH === '1' ? {
    watch: true,
    ignore_watch: [
      'node_modules',
      'frontend/**',
      'logs',
      './**/*.pug',
      './**/*.php',
      './**/*.md',
      './**/*.log*',
      'ecosystem.config.js',
    ],
    watch_options: {
      usePolling: true,
    },
    max_restarts: 5,
  } : {}),


  /** Define staging env options */
  staging: {
    autorestart: true,
  },


  /** Define prod env options */
  production: {
    autorestart: true,
  },
};

// Add debug params
if (ENVIRONMENT === 'development' && !DEBUG_APP) {
  DEBUG_APP = APPS[0].name;
}

const debugApp = APPS.findIndex(i => i.name === DEBUG_APP);
if (debugApp >= 0) {
  APPS[debugApp].interpreter_args = ['--inspect=0.0.0.0:9229'];
}

// Add environment options
Object.assign(defaults, ENV_OPTIONS[ENVIRONMENT]);

// Assign default props to apps
APPS = APPS.map(item => Object.assign(item, defaults));

module.exports = { apps: APPS };
