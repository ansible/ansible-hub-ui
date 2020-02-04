const webpackBase = require('./config/webpack.base.config');

module.exports = webpackBase({
    // The host where the API lives. EX: https://localhost:5001
    API_HOST: '',

    // Path to the API on the API host. EX: /api/automation-hub
    API_BASE_PATH: '/api/automation-hub/',

    // Path on the host where the UI is found. EX: /apps/automation-hub
    UI_BASE_PATH: '',

    // Determines if the app should be compiled to run on insights or on
    // another platform. Options: insights, standalone
    DEPLOYMENT_MODE: 'insights',

    // Serve the UI over http or https. Options: true, false
    UI_USE_HTTPS: true,

    // Enables webpack debug mode. Options: true, false
    UI_DEBUG: true,

    // Target compilation environment. Options: dev, prod
    TARGET_ENVIRONMENT: 'dev',
});
