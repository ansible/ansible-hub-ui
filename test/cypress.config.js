const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1200,
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
});
