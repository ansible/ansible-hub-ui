const webpackBase = require('./webpack.base.config');

// Compile configuration for stnadalone mode
module.exports = webpackBase({
  API_HOST: '',
  API_BASE_PATH: '/api/galaxy/',
  UI_BASE_PATH: '/ui/',
  DEPLOYMENT_MODE: 'standalone',
  NAMESPACE_TERM: 'namespaces',
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  TARGET_ENVIRONMENT: 'prod',
  UI_EXTERNAL_LOGIN_URI: '/login',
  WEBPACK_PUBLIC_PATH: '/static/galaxy_ng/',
});
