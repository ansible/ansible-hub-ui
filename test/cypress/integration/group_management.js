describe('Hub Group Management Tests', () => {
  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
  });

  beforeEach(() => {
    cy.login();
  });

  it('admin user can create/delete a group', () => {
    let name = 'testGroup';

    cy.createGroup(name);
    cy.contains(name).should('exist');

    cy.deleteGroup(name);
    cy.contains('No groups yet').should('exist');
  });

  it('admin user can add/remove a user to/from a group', () => {
    let groupName = 'testGroup';
    let userName = 'testUser';

    cy.createGroup(groupName);
    cy.createUser(userName);
    cy.addUserToGroup(groupName, userName);
    cy.removeUserFromGroup(groupName, userName);
    cy.galaxykit('group delete', groupName);
    cy.deleteUser(userName);
  });

  it.skip('admin user can add/remove roles to/from a group', () => {
    const name = 'testGroup';
    const galaxyRoles = [
      'galaxy.collection_admin',
      'galaxy.execution_environment_admin',
      'galaxy.namespace_owner',
      'galaxy.publisher',
      'galaxy.synclist_owner',
    ];

    cy.galaxykit('group create', name);

    cy.addRolesToGroup(name, galaxyRoles);

    galaxyRoles.forEach((role) => {
      cy.contains(`Role ${role} has been successfully added to ${name}.`);

      cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${role}"]`);
    });

    cy.removeRolesFromGroup(name, galaxyRoles);
    cy.contains('There are currently no roles assigned to this group.');

    cy.galaxykit('group delete', name);
  });
});
