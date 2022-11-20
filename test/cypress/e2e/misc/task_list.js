const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Task table contains correct headers and filter', () => {
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
