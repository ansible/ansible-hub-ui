// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-file-upload';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// ************************************************************
// The chrome ui in cloud is unstable and causes random
// exceptions, so we need to ignore those wherever possible
// *************************************************************/
// https://github.com/quasarframework/quasar/issues/2233#issuecomment-414070235
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
