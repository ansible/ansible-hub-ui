describe('API Token Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  it('token is generated', () => {
    cy.menuGo('Collections > API token');
    cy.contains('Load token').click();

    cy.get('.pf-v5-c-clipboard-copy__text').should('match', /^[0-9a-f]{40}$/);
  });
});
