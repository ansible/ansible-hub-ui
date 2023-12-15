describe('collection tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('deletes an entire collection', () => {
    cy.galaxykit('-i collection upload test_namespace test_collection');
    cy.galaxykit('task wait all');

    cy.visit('/ui/repo/published/test_namespace/test_collection');

    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-collection-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains('No collections yet', { timeout: 10000 });
  });

  it('deletes a collection version', () => {
    cy.galaxykit('-i collection upload my_namespace my_collection');
    cy.menuGo('Collections > Collections');
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/namespaces/my_namespace/?*',
    ).as('reload');
    cy.get('a[href*="ui/repo/published/my_namespace/my_collection"]').click();
    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-version-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.wait('@reload', { timeout: 50000 });
    cy.get('h4[class=pf-c-alert__title]').should(
      'have.text',
      'Success alert:Collection "my_collection v1.0.0" has been successfully deleted.',
    );
  });
});
