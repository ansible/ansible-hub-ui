// https://on.cypress.io/configuration
import 'cypress-file-upload';
import './commands';
import './login';

// standalone-only tests, skipped on gateway (when CYPRESS_HUB_GATEWAY=true)
describe.standalone = (...args) =>
  ['0', 'false'].includes(Cypress.env('HUB_GATEWAY') || 'false')
    ? describe(...args)
    : describe.skip(...args);
it.standalone = (...args) =>
  ['0', 'false'].includes(Cypress.env('HUB_GATEWAY') || 'false')
    ? it(...args)
    : it.skip(...args);
