const { webpackBase, proxy } = require('./webpack.base.config');

// Used for getting the correct host when running in a container
const proxyTarget = process.env.API_PROXY || 'http://localhost:55001';

const apiBasePath = process.env.API_BASE_PATH || '/api/galaxy/';
const uiExternalLoginURI = process.env.UI_EXTERNAL_LOGIN_URI || '/login';

module.exports = webpackBase({
  // The host where the API lives. EX: https://localhost:55001
  API_HOST: '',

  // Path to the API on the API host. EX: /api/automation-hub
  API_BASE_PATH: apiBasePath,

  // Path on the host where the UI is found. EX: /apps/automation-hub
  UI_BASE_PATH: '/ui/',

  // Port that the UI is served over
  UI_PORT: 8002,

  // Serve the UI over http or https. Options: true, false
  UI_USE_HTTPS: false,

  // Login URI to allow stand alone with and without keycloak
  UI_EXTERNAL_LOGIN_URI: uiExternalLoginURI,

  // Value for webpack.devServer.proxy
  // https://webpack.js.org/configuration/dev-server/#devserverproxy
  // used to get around CORS requirements when running in dev mode
  WEBPACK_PROXY: [
    proxy('/api/', proxyTarget),
    proxy('/pulp/api/', proxyTarget),
    proxy('/v2/', proxyTarget),
    proxy('/extensions/v2/', proxyTarget),
    proxy('/static/rest_framework/', proxyTarget),
  ],
});
