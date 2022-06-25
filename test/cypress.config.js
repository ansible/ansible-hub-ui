const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  e2e: {
    setupNodeEvents(on, _config) {
      return require('./cypress/plugins/console-logger').install(on);
    },
    baseUrl: 'http://localhost:8002',
    specPattern: 'cypress/e2e/**/*.js',
  },
});
