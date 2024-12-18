const { webpackBase } = require('./webpack.base.config');
const cloudBeta = process.env.HUB_CLOUD_BETA; // "true" | "false" | undefined (=default)

// Compile configuration for deploying to insights
module.exports = webpackBase({
  API_BASE_PATH: '/api/automation-hub/',
  UI_BASE_PATH:
    cloudBeta === 'true'
      ? '/preview/ansible/automation-hub/'
      : '/ansible/automation-hub/',
  IS_INSIGHTS: true,
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  APPLICATION_NAME: 'Automation Hub',
});
