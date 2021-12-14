describe('API Token Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  it('token is generated', () => {
    cy.menuGo('Collections > API token management');
    cy.contains('Load token').click();

    cy.get('[aria-label="Copyable input"]')
      .invoke('val')
      .should('match', /^[0-9a-f]{40}$/);
  });
});
