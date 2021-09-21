describe('Task detail', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  before(() => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/repositories?tab=remote');

    cy.intercept(
      'POST',
      Cypress.env('prefix') + '/content/rh-certified/v3/sync/',
    ).as('sync');

    cy.contains('button', 'Sync').click();

    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/remotes/?*').as(
      'remotes',
    );

    cy.wait('@sync');
    cy.wait('@remotes');
  });

  it('contains correct headers and field names.', () => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/tasks');
    cy.contains('Pulp Ansible: Collections sync').click();

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
