describe('Group Permissions Tests', () => {
  let urljoin = require('url-join');
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let users = {};
  let groups = {};

  let groupsUrl = urljoin(baseUrl, 'ui/group-list');

  function addTestUser(user, group) {
    users[user] = {};
    users[user].group = group;
    cy.galaxykit('user create', user, user + 'Password');
    if (group != null) {
      cy.addUserToGroup(group, user);
      cy.addUserToGroup('allGroup', user);
    }
  }

  function addTestGroup(group, permissions) {
    groups[group] = {};
    groups[group].permissions = permissions;
    cy.createGroup(group);
    cy.addPermissions(group, [{ group: 'groups', permissions: permissions }]);
  }

  function userHasPermission(user, permission) {
    if (!users[user].group) return false;
    if (groups[users[user].group].permissions.includes(permission)) return true;
  }

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();

    cy.login(adminUsername, adminPassword);
    cy.visit(baseUrl);

    // base group is needed because if no group is in list, you can always add Group even if you dont have permissions
    addTestGroup('baseGroup', []);
    addTestGroup('allGroup', []);

    //addTestGroup('group2', []);
    //addTestGroup('group3', ['View group']);
    //addTestGroup('group4', ['View group', 'Add group', 'Change group']);
    addTestGroup('group5', ['View group', 'Delete group']);

    //addTestUser('user1', null);
    //addTestUser('user2', 'group2');
    //addTestUser('user3', 'group3');
    //addTestUser('user4', 'group4');
    addTestUser('user5', 'group5');
  });

  it('Check user privilleges', () => {
    Object.keys(users).forEach(user => {
      cy.login(user, user + 'Password');
      cy.visit(baseUrl);
      cy.contains(user);

      let canViewGroups = userHasPermission(user, 'View group');
      let canChangeGroups = userHasPermission(user, 'Change group');
      let canAddGroups = userHasPermission(user, 'Add group');
      let canDeleteGroups = userHasPermission(user, 'Delete group');

      let userGroup = users[user].group;

      if (canViewGroups) {
        cy.menuGo('User Access > Groups');
        cy.contains('Groups');
        cy.contains('a', userGroup).click();
        cy.contains('namespaces');
        cy.contains('collections');
        cy.contains('users');
        cy.contains('groups');
        cy.contains('remotes');
        cy.contains('containers');

        if (canChangeGroups) {
          cy.contains('button', 'Edit').click();

          groups[userGroup].permissions.forEach(permission => {
            cy.contains(permission);
          });

          cy.menuGo('User Access > Groups');
        } else {
          cy.contains('button', 'Edit').should('not.exist');
        }

        if (canAddGroups) {
          cy.createGroup(userGroup + 'NewGroup');
          cy.menuGo('User Access > Groups');
        } else {
          cy.contains('button', 'Add').should('not.exist');
        }

        if (canDeleteGroups) {
          cy.contains('button', 'Delete').click();
          //cy.contains('button', 'Cancel').click();
          cy.contains('button', 'Delete').click();
          //cy.contains('button', 'Delete').click({force : true});
        } else {
          cy.contains('button', 'Delete').should('not.exist');
        }
      } else {
        cy.contains('Groups').should('not.exist');
        cy.visit(groupsUrl);
        cy.contains('Groups').should('not.exist');
      }
    });
  });
});
