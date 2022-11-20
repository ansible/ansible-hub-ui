const apiPrefix = Cypress.env('apiPrefix');
const pulpPrefix = Cypress.env('pulpPrefix');

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
    const name = 'testGroup';

    cy.createGroupManually(name);

    cy.deleteGroupManually(name);
    cy.contains('No groups yet').should('exist');
  });

  it('admin user can add/remove a user to/from a group', () => {
    let groupName = 'testGroup';
    let userName = 'testUser';

    cy.createUser(userName);
    cy.createGroupManually(groupName);

    cy.addUserToGroupManually(groupName, userName);

    cy.removeUserFromGroupManually(groupName, userName);

    cy.galaxykit('group delete', groupName);
    cy.galaxykit('user delete', userName);
  });

  it('admin user can add/remove roles to/from a group', () => {
    const groupName = 'testGroup';
    const roleName = 'galaxy.test_role';

    cy.galaxykit('group create', groupName);

    cy.createRole(roleName, 'This role has all galaxy perms', [], true);

    // add role to group manually
    cy.intercept('GET', `${apiPrefix}_ui/v1/groups/*`).as('groups');
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.wait('@groups');
    cy.get('[data-cy=add-roles]').click();

    cy.get('[aria-label="Items per page"]').click();
    cy.contains('100 per page').click();

    cy.get(`[data-cy="RoleListTable-CheckboxRow-row-${roleName}"]`)
      .find('input')
      .click();

    cy.get('.pf-c-wizard__footer > button').contains('Next').click();

    cy.contains(roleName);

    cy.intercept('GET', `${pulpPrefix}roles/*`).as('roles');

    cy.get('.pf-c-wizard__footer > button').contains('Add').click();

    cy.contains(
      `Role ${roleName} has been successfully added to ${groupName}.`,
    );

    cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${roleName}"]`);

    cy.get(
      `[data-cy="RoleListTable-ExpandableRow-row-${roleName}"] [data-cy="kebab-toggle"]`,
    ).click();
    cy.get('.pf-c-dropdown__menu-item').contains('Remove role').click();
    cy.get('[data-cy="delete-button"]').contains('Delete').click();

    cy.contains('There are currently no roles assigned to this group.');

    cy.galaxykit('group delete', groupName);
  });
});
