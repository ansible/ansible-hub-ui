const webpackBase = require('./webpack.base.config');

// Used for getting the correct host when running in a container
const proxyHost = process.env.API_PROXY_HOST || 'localhost';
const proxyPort = process.env.API_PROXY_PORT || '5001';

module.exports = webpackBase({
  // The host where the API lives. EX: https://localhost:5001
  API_HOST: '',

  // Path to the API on the API host. EX: /api/automation-hub
  API_BASE_PATH: '/api/automation-hub/',

  // Path on the host where the UI is found. EX: /apps/automation-hub
  UI_BASE_PATH: '/ui/',

  // Port that the UI is served over
  UI_PORT: 8002,

  // Determines if the app should be compiled to run on insights or on
  // another platform. Options: insights, standalone
  DEPLOYMENT_MODE: 'standalone',

  NAMESPACE_TERM: 'namespaces',

  // Serve the UI over http or https. Options: true, false
  UI_USE_HTTPS: false,

  // Enables webpack debug mode. Options: true, false
  UI_DEBUG: true,

  // Target compilation environment. Options: dev, prod
  TARGET_ENVIRONMENT: 'dev',

  // Value for webpack.devServer.proxy
  // https://webpack.js.org/configuration/dev-server/#devserverproxy
  // used to get around CORS requirements when running in dev mode
  WEBPACK_PROXY: {
    '/api/automation-hub/': `http://${proxyHost}:${proxyPort}`,
  },
});
