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

    let remotes = Cypress.env('prefix') + '_ui/v1/remotes/?*';

    cy.intercept('GET', remotes).as('remotes');

    cy.contains('button', 'Sync').click();
    cy.wait('@sync');
    cy.wait('@remotes');
  });

  it('contains correct headers and field names.', () => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/tasks');
    cy.contains('Pulp Ansible: Collections sync').click();

    [
      'Pulp Ansible: Collections sync',
      'Task detail',
      'Task name',
      'Created on',
      'Finished at',
      'Task groups',
      'Task group',
      'Parent task',
      'Child task',
      'Reserve resources',
      'Type',
      'Name',
      'remotes',
      'rh-certified',
      'repositories',
    ].forEach((item) => {
      cy.contains('.card-area', item);
    });
  });
});
