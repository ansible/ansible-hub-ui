describe('Namespaces Page Tests', () => {
  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('-i group create', 'testGroup1');
    cy.galaxykit('-i group create', 'testGroup2');

    cy.galaxykit('-i user create', 'testUser2', 'p@ssword1');
    cy.galaxykit('user group add', 'testUser2', 'testGroup2');

    cy.galaxykit('-i namespace create', 'testns1');
    cy.galaxykit('-i namespace create', 'testns2');

    //FIXME roles
    //cy.galaxykit('namespace addgroup', 'testns1', 'testGroup1');
    //cy.galaxykit('namespace addgroup', 'testns2', 'testGroup2');
  });

  after(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    cy.deleteNamespacesAndCollections();
  });

  it('can navigate to public namespace list', () => {
    cy.login('testUser2', 'p@ssword1');
    cy.menuGo('Collections > Namespaces');

    cy.contains('testns2').should('exist');
    cy.contains('testns1').should('exist');
  });

  it.skip('can navigate to personal namespace list', () => {
    cy.login('testUser2', 'p@ssword1');
    cy.menuGo('Collections > Namespaces');

    cy.contains('My namespaces').click();

    cy.contains('testns2').should('exist');
    cy.contains('testns1').should('not.exist');
  });
});
