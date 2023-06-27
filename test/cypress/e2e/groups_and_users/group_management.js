const apiPrefix = Cypress.env('apiPrefix');
const pulpPrefix = Cypress.env('pulpPrefix');

function createGroupManually(name) {
  cy.intercept('GET', `${apiPrefix}_ui/v1/groups/?*`).as('loadGroups');
  cy.menuGo('User Access > Groups');
  cy.wait('@loadGroups');

  cy.contains('Create').click();

  cy.intercept('POST', `${apiPrefix}_ui/v1/groups/`).as('submitGroup');
  cy.contains('div', 'Name *').findnear('input').first().type(`${name}{enter}`);
  cy.wait('@submitGroup');

  // Wait for the list to update
  cy.contains(name).should('exist');
}

function addUserToGroupManually(groupName, userName) {
  cy.menuGo('User Access > Groups');
  cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
  cy.contains('button', 'Users').click();
  cy.contains('button', 'Add').click();
  cy.get('input.pf-c-select__toggle-typeahead').type(userName);
  cy.contains('button', userName).click();
  cy.get('.pf-c-content h2').click(); // click modal header to close dropdown
  cy.contains('footer > button', 'Add').click({ force: true });
  cy.get(`[data-cy="GroupDetail-users-${userName}"]`).should('exist');
}

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

    createGroupManually(name);

    cy.deleteGroupManually(name);
    cy.contains('No groups yet').should('exist');
  });

  it('admin user can add/remove a user to/from a group', () => {
    let groupName = 'testGroup';
    let userName = 'testUser';

    cy.createUser(userName);
    createGroupManually(groupName);

    addUserToGroupManually(groupName, userName);

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
