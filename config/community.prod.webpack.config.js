const webpackBase = require('./webpack.base.config');

// Compile configuration for stnadalone mode
module.exports = webpackBase({
  API_BASE_PATH: '/api/',
  API_HOST: '',
  APPLICATION_NAME: 'Ansible Galaxy',
  IS_COMMUNITY: true,
  UI_BASE_PATH: '/ui/',
  UI_DEBUG: false,
  UI_EXTERNAL_LOGIN_URI: '/login/github/',
  UI_USE_HTTPS: false,
  WEBPACK_PUBLIC_PATH: '/',
});
