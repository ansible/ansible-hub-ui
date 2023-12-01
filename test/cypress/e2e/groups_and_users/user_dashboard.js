describe('Hub User Management Tests', () => {
  it("the super-user can't delete themselves", () => {
    cy.login();
    cy.menuGo('User Access > Users');
    cy.get('[data-cy="UserList-row-admin"] [aria-label="Actions"]').click();
    cy.containsnear(actionsSelector, 'Delete').click();
    cy.get('button').contains('Delete').should('be.disabled');
    cy.get('button').contains('Cancel').click();
  });
});
