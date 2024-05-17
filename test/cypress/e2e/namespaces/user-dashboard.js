describe('Hub User Management Tests', () => {
  describe('prevents super-user and self deletion', () => {
    it("the super-user can't delete themselves", () => {
      cy.login();
      cy.menuGo('User Access > Users');

      const kebab = '[data-cy="UserList-row-admin"] [aria-label="Actions"]';
      cy.get(kebab).click();
      cy.containsnear(kebab, 'Delete').click();
      cy.get('button').contains('Delete').should('be.disabled');
      cy.get('button').contains('Cancel').click();
    });
  });
});
