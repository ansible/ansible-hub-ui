const { webpackBase } = require('./webpack.base.config');

// Used for getting the correct host when running in a container
const proxyTarget = process.env.API_PROXY || 'http://localhost:5001';

const cloudBeta = process.env.HUB_CLOUD_BETA; // "true" | "false" | undefined (=default)

module.exports = webpackBase({
  // The host where the API lives. EX: https://localhost:5001
  API_HOST: '',

  // Path to the API on the API host. EX: /api/automation-hub
  API_BASE_PATH: '/api/automation-hub/',

  // Value for standalone.api.target
  API_PROXY: proxyTarget,

  // Path on the host where the UI is found. EX: /apps/automation-hub
  UI_BASE_PATH:
    cloudBeta !== 'false'
      ? '/preview/ansible/automation-hub/'
      : '/ansible/automation-hub/',

  // Port that the UI is served over
  UI_PORT: 8002,

  // Determines if the app should be compiled to run on insights
  IS_INSIGHTS: true,

  // Determines the title of the app
  APPLICATION_NAME: 'Automation Hub',

  // Serve the UI over http or https. Options: true, false
  UI_USE_HTTPS: false,

  // Enables webpack debug mode. Options: true, false
  UI_DEBUG: true,
});
