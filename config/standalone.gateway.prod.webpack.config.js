const webpackBase = require('./webpack.base.config');

// Compile configuration for stnadalone mode
module.exports = webpackBase({
  API_BASE_PATH: '/api/galaxy/',
  UI_BASE_PATH: '/hub/',
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  UI_EXTERNAL_LOGIN_URI: '/',
  WEBPACK_PUBLIC_PATH: '/hub/',
});
