describe('Hub Group Management Tests', () => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.deleteTestGroups();
    cy.deleteTestUsers();
  });

  it('admin user can create/delete a group', () => {
    let name = 'testGroup';
    cy.login(adminUsername, adminPassword);
    cy.createGroup(name);
    cy.contains(name).should('exist');
    cy.deleteGroup(name);
    cy.contains(name).should('not.exist');
  });

  it('admin user can add/remove a user to/from a group', () => {
    let groupName = 'testGroup';
    let userName = 'testUser';
    cy.login(adminUsername, adminPassword);
    cy.createGroup(groupName);
    cy.createUser(userName);
    cy.addUserToGroup(groupName, userName);
    cy.removeUserFromGroup(groupName, userName);
    cy.deleteGroup(groupName);
    cy.deleteUser(userName);
  });

  it('admin user can add/remove permissions to/from a group', () => {
    let name = 'testGroup';
    let permissionTypes = [
      'namespaces',
      'collections',
      'users',
      'groups',
      'remotes',
    ];
    cy.login(adminUsername, adminPassword);
    cy.createGroup(name);
    cy.contains(name).should('exist');

    cy.addAllPermissions(name);
    permissionTypes.forEach((permGroup) => {
      cy.get(`.pf-l-flex.pf-m-align-items-center.${permGroup}`)
        .contains('span', 'No permission')
        .should('not.exist');
    });

    cy.removeAllPermissions(name);
    permissionTypes.forEach((permGroup) => {
      cy.get(`.pf-l-flex.pf-m-align-items-center.${permGroup}`)
        .contains('span', 'No permission')
        .should('exist');
    });

    cy.deleteGroup(name);
    cy.contains(name).should('not.exist');
  });
});
