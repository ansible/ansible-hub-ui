process.env.NODE_ENV = 'production';
const webpackBase = require('./webpack.base.config');
const cloudBeta = process.env.HUB_CLOUD_BETA; // "true" | "false" | undefined (=default)

// Compile configuration for deploying to insights
module.exports = webpackBase({
  API_HOST: '',
  API_BASE_PATH: '/api/automation-hub/',
  UI_BASE_PATH:
    cloudBeta === 'true'
      ? '/preview/ansible/automation-hub/'
      : '/ansible/automation-hub/',
  DEPLOYMENT_MODE: 'insights',
  NAMESPACE_TERM: 'partners',
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  APPLICATION_NAME: 'Automation Hub',
});
