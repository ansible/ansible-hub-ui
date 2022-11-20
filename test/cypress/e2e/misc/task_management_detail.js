const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Task detail', () => {
  before(() => {
    cy.login();
    cy.visit(`${uiPrefix}repositories?tab=remote`);

    cy.contains('Repo Management');
    cy.contains('Sync');

    cy.intercept('POST', `${apiPrefix}content/rh-certified/v3/sync/`).as(
      'sync',
    );

    cy.intercept('GET', `${apiPrefix}_ui/v1/remotes/?*`).as('remotes');

    cy.get('tr').eq(2).contains('Sync').click();

    cy.wait('@sync');
    cy.wait('@remotes');
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
