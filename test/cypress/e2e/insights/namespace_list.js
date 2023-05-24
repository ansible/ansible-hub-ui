const uiPrefix = Cypress.env('uiPrefix');

describe('Namespaces Page Tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.galaxykit('-i namespace create', 'testns2');
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  it('can navigate to admin public namespace list', () => {
    cy.login();
    cy.visit(`${uiPrefix}partners`);
    cy.contains('testns2').should('exist');
    cy.contains('testns1').should('exist');
  });
});
