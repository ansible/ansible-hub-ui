describe('Token Management Tests', () => {
  before(() => {
    cy.deleteTestUsers();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  it('user can load token', () => {
    cy.visit('/ui/token');
    cy.intercept('POST', Cypress.env('prefix') + 'v3/auth/token/').as(
      'tokenPost',
    );

    cy.contains('Load token').click();
    cy.get('.pf-c-clipboard-copy').should('exist');

    cy.wait('@tokenPost')
      .its('response.body.token')
      .then((token) => {
        cy.get('[aria-label="Copyable input"]').should('have.value', token);
      });
  });
});
