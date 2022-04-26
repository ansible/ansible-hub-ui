describe('Hub User Management Tests', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'test';
  let password = 'p@ssword1';

  /*
  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    cy.cookieReset();

    cy.cookieLogin(adminUsername, adminPassword);

    cy.createUser(username, password, 'Test F', 'Test L', 'test@example.com');
    cy.contains('[data-cy="UserList-row-test"]', 'Test F');
    cy.galaxykit('group create', 'delete-user');
    cy.galaxykit('group perm add', 'delete-user', 'galaxy.view_user');
    cy.galaxykit('group perm add', 'delete-user', 'galaxy.delete_user');
    cy.addUserToGroup('delete-user', username);
  });
  */

  describe('basic check of user page', () => {
    /*
    beforeEach(() => {
      cy.cookieLogin(adminUsername, adminPassword);
      cy.menuGo('User Access > Users');
    });
    */

    it.skip('User table lists users', () => {
      cy.contains('[data-cy="UserList-row-admin"]', 'admin');
    });
  });

  describe('Creation and management of users', () => {
    // beforeEach(() => {
    //   cy.cookieLogin(adminUsername, adminPassword);
    //   cy.menuGo('User Access > Users');
    // });

    it.skip('Can create new users', () => {
      cy.contains('[data-cy="UserList-row-test"]', 'Test F');
      cy.contains('[data-cy="UserList-row-test"]', 'Test L');
      cy.contains('[data-cy="UserList-row-test"]', 'test@example.com');

      cy.contains('.body', 'Test F').not();
    });
  });

  describe('prevents super-user and self deletion', () => {
    function attemptToDelete(toDelete) {
      const actionsSelector = `[data-cy="UserList-row-${toDelete}"] [aria-label="Actions"]`;
      cy.menuGo('User Access > Users');
      cy.get(actionsSelector).click();
      cy.containsnear(actionsSelector, 'Delete').click();
      cy.get('footer > button:contains("Delete")').should('be.disabled');
      cy.get('footer > button:contains("Cancel")').click();
    }

    it.skip("an ordinary user can't delete themselves", () => {
      cy.cookieLogin(username, password);
      attemptToDelete(username);
    });

    it.skip("an ordinary user can't delete the super-user", () => {
      cy.cookieLogin(username, password);
      attemptToDelete(adminUsername);
    });

    it("the super-user can't delete themselves", () => {
      cy.cookieLogin(adminUsername, adminPassword);
      attemptToDelete(adminUsername);
    });
  });
});
