const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    setupNodeEvents(on, _config) {
      if (process.env.CONSOLE_LOG_TO_TERMINAL) {
        return require('./cypress/plugins/console-logger').install(on);
      }
    },
    baseUrl: 'http://localhost:8002',
    specPattern: 'cypress/e2e/**/*.js',
  },
  // only record videos when running action in debug mode
  video: !!process.env.RUNNER_DEBUG,
});
