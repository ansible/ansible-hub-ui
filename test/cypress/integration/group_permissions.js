describe('Group Permissions Tests', () => {
  let urljoin = require('url-join');
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let groupsUrl = urljoin(baseUrl, 'ui/group-list');

  function addTestUser(user, group) {
    cy.galaxykit('user create', user, user + 'Password');
    if (group != null) {
      cy.galaxykit('user group add', user, group);
    }
  }

  function addTestGroup(group, permissions) {
    cy.wait(1000);
    cy.createGroup(group);
    cy.wait(1000);
    //cy.galaxykit('-i group create', group);
    cy.addPermissions(group, [{ group: 'groups', permissions: permissions }]);
  }

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();

    cy.login(adminUsername, adminPassword);

    // base group is needed because if no group is in list, you can always add Group even if you dont have permissions
    //addTestGroup('baseGroup', []);
    //addTestGroup('group2', []);
    //addTestGroup('group3', ['View group']);
    addTestGroup('group4', [
      'View group',
      'Delete group',
      'Add group',
      'Change group',
    ]);

    //addTestUser('user1', null);
    //addTestUser('user2', 'group2');
    //addTestUser('user3', 'group3');
    addTestUser('user4', 'group4');
    cy.logout();
  });

  it('beforeAll', () => {});

  /*
  it('it cant see groups', () => {
	// test user without any group at all
	let user = 'user1';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.contains('Groups').should('not.exist');
	cy.visit(groupsUrl);
	cy.contains('You do not have have access to Automation Hub');
	cy.logout();
	
	// test user in group with no privilleges 
	user = 'user2';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.contains('Groups').should('not.exist');
	cy.visit(groupsUrl);
	cy.contains('You do not have have access to Automation Hub');
  });
	
  
  it('can view groups', () => {
	let user = 'user3';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.menuGo('User Access > Groups');
	cy.contains('Groups');
  });
	
  it('can not change groups', () => {
	let user = 'user3';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.menuGo('User Access > Groups');
	cy.contains('button', 'Edit').should('not.exist');
  });
  
  it('can not add groups', () => {
	let user = 'user3';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.menuGo('User Access > Groups');
	cy.contains('button', 'View').should('not.exist');
  });
  
  it('can not delete groups', () => {
	let user = 'user3';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.menuGo('User Access > Groups');
	cy.contains('button', 'Delete').should('not.exist');
  });
  
  it('can add group', () => {
	let user = 'user4';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	cy.createGroup('NewGroup');
  });
  
  it.skip('can delete group', () => {
	// this is not working yet, API is returning error, however group is still deleted 
	// The group should be deleted, because user has rights for it, API should not return error
	let user = 'user4';
	cy.login(user, user + 'Password');
	cy.wait(2000);
	
	cy.menuGo('User Access > Groups');
	cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/groups/**').as('deleteGroup',);
	cy.get(`[aria-labelledby=${'NewGroup'}] [aria-label=Delete]`).click();
	cy.contains('[role=dialog] button', 'Delete').click();
	cy.wait('@deleteGroup').then(({ request, response }) => {
		expect(response.statusCode).to.eq(204);
	});
	cy.wait(2000);
  });*/

  it('can change group', () => {
    let user = 'user4';
    cy.login(user, user + 'Password');
    cy.wait(2000);

    cy.menuGo('User Access > Groups');
    cy.contains('a', 'group4').click();
    cy.contains('button', 'Edit').click();

    cy.contains('Add group')
      .siblings('button[aria-label=Remove]')
      .click();
    cy.contains('button', 'Save').click();

    cy.contains('button', 'Edit').click();
    cy.contains('div', 'groups')
      .get('[aria-label="Select permissions"]')
      .type('Add group');
  });
});
