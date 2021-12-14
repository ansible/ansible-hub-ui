const waitForTaskToFinish = (task, maxRequests, level = 0) => {
  if (level === maxRequests) throw `Maximum requests exceeded.`;

  cy.wait(task).then(({ response }) => {
    if (response.body.state !== 'completed') {
      cy.wait(1000);
      waitForTaskToFinish(task, maxRequests, level + 1);
    }
  });
};

describe('collection tests', () => {
  beforeEach(() => {
    cy.login();
  });

  it('deletes an entire collection', () => {
    cy.galaxykit('-i collection upload test_namespace test_collection');
    cy.visit('/ui/repo/published/test_namespace/test_collection');

    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-collection-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();

    cy.intercept(
      'DELETE',
      Cypress.env('prefix') +
        '/content/published/v3/collections/test_namespace/test_collection',
    ).as('deleteCollection');
    cy.intercept('GET', Cypress.env('prefix') + '/v3/tasks/*').as('taskStatus');

    cy.get('button').contains('Delete').click();

    cy.wait('@deleteCollection').its('response.statusCode').should('eq', 202);

    waitForTaskToFinish('@taskStatus', 10);
    cy.get('@taskStatus.last').then(() => {
      cy.get('.pf-c-alert').contains('Successfully deleted collection.');
    });
  });

  it('deletes a collection version', () => {
    cy.galaxykit('-i collection upload my_namespace my_collection');
    cy.menuGo('Collections > Collections');
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/namespaces/my_namespace/',
    ).as('reload');
    cy.get('a[href*="ui/repo/published/my_namespace/my_collection"]').click();
    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-version-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.wait('@reload', { timeout: 50000 });
    cy.get('h4[class=pf-c-alert__title]').should(
      'have.text',
      'Success alert:Successfully deleted collection.',
    );
  });
});
