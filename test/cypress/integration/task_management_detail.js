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
    cy.wait('@sync');
  });

  it('contains correct headers and field names.', () => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/tasks');
    cy.contains('Pulp Ansible: Collections sync').click();

    cy.contains('Pulp Ansible: Collections sync');
    cy.contains('Task detail');
    cy.contains('Task name');
    cy.contains('Created on');
    cy.contains('Finished at');
    cy.contains('Task groups');
    cy.contains('Task group');
    cy.contains('Parent task');
    cy.contains('Child task');
    cy.contains('Reserve resources');
    cy.contains('Type');
    cy.contains('Name');
    cy.contains('remotes');
    cy.contains('rh-certified');
    cy.contains('repositories');
  });
});
