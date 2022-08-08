describe('test status filter label on list view', () => {
  before(() => {
    cy.login();
    cy.visit('/ui/tasks');
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        'pulp/api/v3/tasks/?ordering=-pulp_created&offset=0&limit=10',
    ).as('tasks');

    cy.wait('@tasks');
  });

  it('shows nicename status filter label', () => {
    // completed
    cy.get(
      '.pf-c-input-group > .pf-c-dropdown > .pf-c-dropdown__toggle',
    ).click();

    cy.get('li').contains('Status').click();
    cy.get('.pf-c-input-group').children().eq(1).click();
    cy.get('li > a').contains('Completed').click();
    cy.get('.pf-c-chip-group__list').contains('completed');

    // failed
    cy.get(
      '.pf-c-input-group > .pf-c-dropdown > .pf-c-dropdown__toggle',
    ).click();

    cy.get('li').contains('Status').click();
    cy.get('.pf-c-input-group').children().eq(1).click();
    cy.get('li > a').contains('Failed').click();
    cy.get('.pf-c-chip-group__list').contains('failed');

    // running
    cy.get(
      '.pf-c-input-group > .pf-c-dropdown > .pf-c-dropdown__toggle',
    ).click();

    cy.get('li').contains('Status').click();
    cy.get('.pf-c-input-group').children().eq(1).click();
    cy.get('li > a').contains('Running').click();
    cy.get('.pf-c-chip-group__list').contains('running');

    // waiting
    cy.get(
      '.pf-c-input-group > .pf-c-dropdown > .pf-c-dropdown__toggle',
    ).click();

    cy.get('li').contains('Status').click();
    cy.get('.pf-c-input-group').children().eq(1).click();
    cy.get('li > a').contains('Waiting').click();
    cy.get('.pf-c-chip-group__list').contains('waiting');
  });
});
