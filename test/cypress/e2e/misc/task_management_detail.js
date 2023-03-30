const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Task detail', () => {
  before(() => {
    cy.login();
    cy.visit(`${uiPrefix}ansible/repositories`);

    cy.contains('Repositories');

    cy.intercept('POST', `${apiPrefix}content/rh-certified/v3/sync/`).as(
      'sync',
    );

    cy.intercept('GET', `${apiPrefix}_ui/v1/remotes/?*`).as('remotes');

    cy.get('[aria-label="Actions"]').eq(1).click();
    cy.get('tr').eq(2).contains('Sync').click();

    cy.get('.pf-c-alert.pf-m-info');
  });

  it('contains correct headers and field names.', () => {
    cy.login();
    cy.visit(`${uiPrefix}tasks`);
    cy.contains('pulp_ansible.app.tasks.collections.sync').click();

    cy.contains('h1', 'Pulp Ansible: Collections sync');
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
