describe('Group Permissions Tests', () => {
  /*
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  function addTestUser(user, group) {
    cy.galaxykit('user create', user, user + 'Password');
    if (group) {
      cy.galaxykit('user group add', user, group);
    }
  }

  function addTestGroup(group, permissions) {
    cy.galaxykit('-i group create', group);
    if (permissions) {
      cy.addPermissions(group, [{ group: 'groups', permissions }]);
    }
  }
  */

  function groupsNotVisible() {
    cy.contains('group2').should('not.exist');
    cy.contains('group3').should('not.exist');
    cy.contains('group4').should('not.exist');
  }

  before(() => {
    /*
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    cy.cookieReset();

    cy.cookieLogin(adminUsername, adminPassword);

    addTestGroup('group2');
    addTestGroup('group3', ['View group']);
    addTestGroup('group4', [
      'View group',
      'Delete group',
      'Add group',
      'Change group',
    ]);
    cy.galaxykit('group perm add', 'group4', 'galaxy.view_user');
    addTestGroup('DeleteGroup');
    addTestUser('user1');
    addTestUser('user2', 'group2');
    addTestUser('user3', 'group3');
    addTestUser('user4', 'group4');
    */
  });

  it.skip("it can't view groups", () => {
    // test user without any group at all
    cy.login('user1', 'user1Password');
    cy.visit('/ui/groups');
    groupsNotVisible();

    // test user in group with no privilleges
    cy.login('user2', 'user2Password');
    cy.visit('/ui/groups');
    groupsNotVisible();
  });

  it.skip('can view groups, can not change groups, can not add groups, can not delete groups', () => {
    cy.login('user3', 'user3Password');
    cy.menuGo('User Access > Groups');

    cy.contains('Groups');
    cy.contains('button', 'Edit').should('not.exist');
    cy.contains('button', 'View').should('not.exist');
    cy.contains('button', 'Delete').should('not.exist');
  });

  it.skip('can add group', () => {
    cy.login('user4', 'user4Password');
    cy.galaxykit('group create', 'NewGroup');
  });

  it.skip('can delete group', () => {
    cy.login('user4', 'user4Password');
    cy.menuGo('User Access > Groups');

    cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/groups/**').as(
      'deleteGroup',
    );
    cy.get(
      `[data-cy="GroupList-row-DeleteGroup"] [aria-label="Actions"]`,
    ).click();
    cy.get('[aria-label=Delete]').click();
    cy.contains('[role=dialog] button', 'Delete').click();
    cy.wait('@deleteGroup').then(({ response }) => {
      expect(response.statusCode).to.eq(204);
    });
  });

  it.skip('can change group', () => {
    cy.login('user4', 'user4Password');

    cy.removePermissions('group4', [
      { group: 'groups', permissions: ['Change group'] },
    ]);
  });
});
