process.env.NODE_ENV = 'production';
const webpackBase = require('./webpack.base.config');

// Compile configuration for stnadalone mode
module.exports = webpackBase({
  API_HOST: '',
  API_BASE_PATH: '/api/',
  UI_BASE_PATH: '/ui/',
  DEPLOYMENT_MODE: 'standalone',
  NAMESPACE_TERM: 'namespaces',
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  UI_EXTERNAL_LOGIN_URI: '/login/github/',
  WEBPACK_PUBLIC_PATH: '/',
});
