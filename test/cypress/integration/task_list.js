describe('Task table contains correct headers and filter', () => {
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

  it('table contains all columns and filter', () => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/tasks');
    cy.contains('Task Management');
    cy.get('[aria-label="name__contains"]');
    ['Task name', 'Created on', 'Started at', 'Finished at', 'Status'].forEach(
      (item) => {
        cy.get('tr[aria-labelledby="headers"] th').contains(item);
      },
    );
  });
});
