const insightsLogin = Cypress.env('insightsLogin');

describe('Namespaces Page Tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.galaxykit('-i namespace create', 'testns2');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  it('can navigate to admin public namespace list', () => {
    cy.login();
    cy.goToNamespaces();
    cy.contains('testns2').should('exist');
    cy.contains('testns1').should('exist');
  });

  if (!insightsLogin) {
    it('can navigate to user public namespace list', () => {
      cy.deleteTestUsers();
      cy.deleteTestGroups();

      cy.galaxykit('-i group create', 'testGroup1');
      cy.galaxykit('-i group create', 'testGroup2');

      cy.galaxykit('-i user create', 'testUser2', 'p@ssword1');
      cy.galaxykit('user group add', 'testUser2', 'testGroup2');

      cy.login('testUser2', 'p@ssword1');
      cy.menuGo('Collections > Namespaces');

      cy.contains('testns2').should('exist');
      cy.contains('testns1').should('exist');

      cy.deleteTestUsers();
      cy.deleteTestGroups();
    });
  }
});
