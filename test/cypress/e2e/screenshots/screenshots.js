const { range } = require('lodash');

const uiPrefix = Cypress.env('uiPrefix');

describe('screenshots', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    // insert test data
    cy.galaxykit('namespace create my_namespace');
    range(5).forEach((i) => {
      cy.galaxykit('-i collection upload my_namespace my_collection' + i);
    });
  });

  beforeEach(() => {
    cy.login();
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  it('takes screenshots', () => {
    const screenshot = (path) => {
      cy.visit(`${uiPrefix}${path}`.replace('//', '/'));
      cy.wait(3000);
      cy.screenshot(path.replaceAll('/', '__'));
      cy.wait(1000);
    };

    screenshot('/');
    screenshot('/collections');
    screenshot('/namespaces');
    // TODO - problems - repositories are showing minutes, so text may quickly change and generate diff
    //screenshot('/ansible/repositories');
    screenshot('/ansible/remotes');
    screenshot('/token');
    screenshot('/approval-dashboard');
    screenshot('/containers');
    screenshot('/registries');
    // screenshot('/tasks'); // TODO fake empty API response
    // screenshot('/signature-keys'); // TODO fake empty API response
    //screenshot('/users');
    screenshot('/group-list');

    // screenshot('/roles');  // TODO fake empty API response
  });
});
