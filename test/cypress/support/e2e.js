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

// community-only tests, skipped when running standalone mode (apiPrefix != /api/)
describe.community = (...args) =>
  Cypress.env('apiPrefix') === '/api/'
    ? describe(...args)
    : describe.skip(...args);
it.community = (...args) =>
  Cypress.env('apiPrefix') === '/api/' ? it(...args) : it.skip(...args);
