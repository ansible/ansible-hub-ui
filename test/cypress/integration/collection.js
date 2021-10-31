function waitForTaskToFinish() {
  cy.wait('@taskStatus').then((res) => {
    if (res.response.body.state === 'running') {
      cy.clock();
      waitForTaskToFinish();
    }

    if (res.response.body.state === 'completed')
      cy.get('.pf-c-alert').contains('Successfully deleted collection.');
  });
}

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

    cy.intercept('GET', Cypress.env('prefix') + '/v3/tasks/*').as('taskStatus');

    cy.get('button').contains('Delete').click();

    waitForTaskToFinish();
  });
});
