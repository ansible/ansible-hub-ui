describe('API Token Tests', () => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
  });

  it('token is generated', () => {
    cy.menuGo('Collections > API Token');
    cy.contains('Load token').click();

    cy.get('[aria-label="Copyable input"]')
      .invoke('val')
      .should('match', /[0-9a-f]{40}?/);
  });
});
