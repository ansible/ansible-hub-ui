import permissions from '../support/permissions';

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

  it('admin user can add/remove roles to/from a group', () => {
    const groupName = 'testGroup';
    const roleName = 'galaxy.all_perms_role';

    cy.galaxykit('group create', groupName);

    cy.createRole(roleName, 'This role has all galaxy perms', permissions);
    cy.addRolesToGroup(groupName, [roleName]);

    cy.contains(
      `Role ${roleName} has been successfully added to ${groupName}.`,
    );

    cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${roleName}"]`);

    cy.get(
      `[data-cy="RoleListTable-ExpandableRow-row-${roleName}"] [data-cy="kebab-toggle"]`,
    ).click();
    cy.contains('Remove Role').click();
    cy.get('[data-cy="delete-button"]').contains('Delete').click();

    cy.contains('There are currently no roles assigned to this group.');

    cy.galaxykit('group delete', groupName);
  });
});
