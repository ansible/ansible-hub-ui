const uiPrefix = Cypress.env('uiPrefix');

describe('Task detail', () => {
  before(() => {
    // Use collection upload to generate a task, which is more reliable than sync
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'task_detail_ns');
    cy.galaxykit('collection upload', 'task_detail_ns', 'task_detail_col');
    // Wait for tasks to be created
    cy.galaxykit('task wait all');
  });

  it('contains correct headers and field names', () => {
    cy.login();
    cy.visit(`${uiPrefix}tasks`);
    // Click on any task to view details (import task from collection upload)
    cy.get('tbody tr:first td a').first().click();

    cy.contains('.card-area h2', 'Task detail');
    cy.contains('.card-area h2', 'Task groups');
    cy.contains('.card-area h2', 'Reserve resources');

    // rest of the content in containers
    [
      'Task name',
      'Created on',
      'Finished at',
      'Task group',
      'Parent task',
      'Child task',
    ].forEach((item) => {
      cy.contains('.card-area', item);
    });
  });
});
