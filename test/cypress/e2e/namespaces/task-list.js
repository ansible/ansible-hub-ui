const uiPrefix = Cypress.env('uiPrefix');

describe('Task table contains correct headers and filter', () => {
  before(() => {
    // Use collection upload to generate a task, which is more reliable than sync
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'task_test_ns');
    cy.galaxykit('collection upload', 'task_test_ns', 'task_test_col');
    // Wait for tasks to be created
    cy.galaxykit('task wait all');
  });

  it('table contains all columns and filter', () => {
    cy.login();
    cy.visit(`${uiPrefix}tasks`);
    cy.contains('Task Management');
    cy.get('[aria-label="name__contains"]');
    ['Task name', 'Created on', 'Started at', 'Finished at', 'Status'].forEach(
      (item) => {
        cy.get('tr[data-cy="SortTable-headers"] th').contains(item);
      },
    );
  });
});
