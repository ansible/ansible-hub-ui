describe('Hub User Management Tests', () => {
  describe('prevents super-user and self deletion', () => {
    it("the super-user can't delete themselves", () => {
      cy.login();
      cy.menuGo('User Access > Users');

      const actionsSelector = `[data-cy="UserList-row-admin"] [aria-label="Actions"]`;
      cy.get(actionsSelector).click();
      cy.containsnear(actionsSelector, 'Delete').click();
      cy.get('button').contains('Delete').should('be.disabled');
      cy.get('button').contains('Cancel').click();
    });
  });
});
