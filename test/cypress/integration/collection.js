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
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');

  before(() => {
    cy.login(adminUsername, adminPassword);
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
    cy.get('@taskStatus.last').then((res) => {
      cy.get('.pf-c-alert').contains('Successfully deleted collection.');
    });
  });
});
