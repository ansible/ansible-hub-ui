describe('Group Permissions Tests', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let groupsUrl = '/ui/group-list';

  function addTestUser(user, group) {
    cy.galaxykit('user create', user, user + 'Password');
    if (group != null) {
      cy.galaxykit('user group add', user, group);
    }
  }

  function addTestGroup(group, permissions) {
    cy.galaxykit('-i group create', group);
    cy.addPermissions(group, [{ group: 'groups', permissions: permissions }]);
  }
  
  function groupsNotVisible()
  {
	  cy.contains('group2').should('not.exist');
	  cy.contains('group3').should('not.exist');
	  cy.contains('group4').should('not.exist');
  }

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    cy.cookieLogin(adminUsername, adminPassword);
    addTestGroup('group2', []);
    addTestGroup('group3', ['View group']);
    addTestGroup('group4', [
      'View group',
      'Delete group',
      'Add group',
      'Change group',
    ]);
    cy.addPermissions('group4', [
      { group: 'users', permissions: ['View user'] },
    ]);
    addTestUser('user1', null);
    addTestUser('user2', 'group2');
    addTestUser('user3', 'group3');
    addTestUser('user4', 'group4');
  });

  it("it can't view groups", () => {
    // test user without any group at all
    let user = 'user1';
    cy.login(user, user + 'Password');
    cy.visit(groupsUrl);
	groupsNotVisible();
	
    // test user in group with no privilleges
    user = 'user2';
    cy.login(user, user + 'Password');
    cy.visit(groupsUrl);
	groupsNotVisible();
  });

  it('can view groups, can not change groups, can not add groups, can not delete groups', () => {
    let user = 'user3';
    cy.login(user, user + 'Password');
    cy.menuGo('User Access > Groups');
    cy.contains('Groups');
    cy.menuGo('User Access > Groups');
    cy.contains('button', 'Edit').should('not.exist');
    cy.menuGo('User Access > Groups');
    cy.contains('button', 'View').should('not.exist');
    cy.menuGo('User Access > Groups');
    cy.contains('button', 'Delete').should('not.exist');
  });

  it('can add group', () => {
    let user = 'user4';
    cy.login(user, user + 'Password');
    cy.createGroup('NewGroup');
  });

  it('can delete group', () => {
    // this is not working yet, API is returning error, however group is still deleted
    // The group should be deleted, because user has rights for it, API should not return error
    // The problem is probably at API side.
    let user = 'user4';
    cy.login(user, user + 'Password');
    cy.menuGo('User Access > Groups');
    cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/groups/**').as(
      'deleteGroup',
    );
    cy.get(`[aria-labelledby=${'NewGroup'}] [aria-label=Delete]`).click();
    cy.contains('[role=dialog] button', 'Delete').click();
    cy.wait('@deleteGroup').then(({ request, response }) => {
      expect(response.statusCode).to.eq(204);
    });
  });

  it('can change group', () => {
    let user = 'user4';
    cy.login(user, user + 'Password');
    cy.removePermissions('group4', [
      { group: 'groups', permissions: ['Change group'] },
    ]);
  });
});
