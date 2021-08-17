describe('Namespaces Page Tests', () => {
  let namespace0 = 'namespace_test0';
  let namespace1 = 'namespace_test1';
  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    // TODO: cy.deleteTestNamespaces();

    cy.galaxykit('-i group create', 'testGroup1');
    cy.galaxykit('-i group create', 'testGroup2');

    cy.galaxykit('-i user create', 'testUser2', 'p@ssword1');
    cy.galaxykit('user group add', 'testUser2', 'testGroup2');

    cy.galaxykit('-i namespace create', namespace0);
    cy.galaxykit('-i namespace create', namespace1);
    cy.galaxykit('namespace addgroup', namespace0, 'testGroup1');
    cy.galaxykit('namespace addgroup', namespace1, 'testGroup2');
  });

  it('can navigate to pubic namespace list', () => {
    cy.login('testUser2', 'p@ssword1');
    cy.menuGo('Collections > Namespaces');

    cy.contains(namespace1).should('exist');
    cy.contains(namespace0).should('exist');
  });

  it('can navigate to personal namespace list', () => {
    cy.login('testUser2', 'p@ssword1');
    cy.menuGo('Collections > Namespaces');

    cy.contains('My namespaces').click();

    cy.contains(namespace1).should('exist');
    cy.contains(namespace0).should('not.exist');
  });
});
