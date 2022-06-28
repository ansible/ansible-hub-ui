describe('Group Roles Tests', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  const groupName = `test_group_${num}`;

  const testRole = {
    name: `galaxy.test_role_${num}`,
    description: 'test role for test group',
    permissions: [
      {
        group: 'groups',
        permissions: [
          'Add group',
          'Change group',
          'Delete group',
          'View group',
        ],
      },
      {
        group: 'namespaces',
        permissions: ['Add namespace', 'Delete namespace'],
      },
    ],
  };

  const testContainerRole = {
    name: 'galaxy.test_container_role',
    description: 'this is test container role',
    permissions: [
      {
        group: 'containers',
        permissions: [
          'Change containers',
          'Change image tags',
          'Delete container repository',
        ],
      },
    ],
  };

  beforeEach(() => {
    cy.login();
  });

  before(() => {
    cy.login();
    cy.createGroup(groupName);
    cy.createRole(
      testContainerRole.name,
      testContainerRole.description,
      testContainerRole.permissions,
    );
  });

  after(() => {
    cy.galaxykit('group delete', groupName);
    cy.galaxykit('group delete', 'empty_group');
    cy.deleteRole(testRole.name);
  });

  it('should add a new role to group', () => {
    cy.createRole(testRole.name, testRole.description, testRole.permissions);
    cy.addRolesToGroup(groupName, [testRole.name]);

    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.get('[data-cy="RoleListTable"]').contains(testRole.name);
    cy.get(
      `[data-cy="RoleListTable-ExpandableRow-row-${testRole.name}"] .pf-c-table__toggle`,
    ).click();

    cy.contains('1 more').click();
    testRole.permissions.forEach(({ permissions }) => {
      permissions.forEach((perm) => {
        cy.contains(perm);
      });
    });
  });

  it('should test filtering of assigned roles', () => {
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();

    cy.get('[aria-label="role__icontains"]').type(`_${num}{enter}`);
    cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${testRole.name}"]`);

    cy.get('[aria-label="role__icontains"]').clear().type('foo bar{enter}');
    cy.get('[data-cy="EmptyState"]').contains('No results found');

    cy.contains('Clear all filters').click();
    cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${testRole.name}"]`);
  });

  it('should test filtering of roles in "Add roles" wizard', () => {
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();

    cy.get('[data-cy=add-roles]').click();

    cy.get('[aria-label="name__icontains"]').type(`_${num}{enter}`);
    cy.get(`[data-cy="RoleListTable-CheckboxRow-row-${testRole.name}"]`);
    cy.get('[aria-label="Add roles"]').contains('Clear all filters').click();
  });

  it('should correctly select and preview roles', () => {
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.get('[data-cy=add-roles]').click();

    cy.get('.hub-custom-wizard-layout [aria-label="Items per page"]').click();
    cy.get('.hub-custom-wizard-layout').contains('100 per page').click();

    cy.get(
      `[data-cy="RoleListTable"] [data-cy="RoleListTable-CheckboxRow-row-${testRole.name}"] [type="checkbox"]`,
    )
      .scrollIntoView()
      .check()
      .should('be.disabled');

    cy.get(
      `[data-cy="RoleListTable"] [data-cy="RoleListTable-CheckboxRow-row-${testContainerRole.name}"] [type="checkbox"]`,
    )
      .uncheck()
      .should('not.be.disabled')
      .click();

    cy.get('[aria-label="Add roles content"]').contains('Selected roles');
    cy.get(`[data-cy="HubPermission-${testContainerRole.name}"]`);

    cy.contains('Next').click();

    cy.get('.hub-custom-wizard-layout').contains(groupName);
    cy.get('.hub-custom-wizard-layout').contains(testContainerRole.name);

    cy.get('.pf-c-wizard__footer > button')
      .contains('Add')
      .should('not.be.disabled');
  });

  it('should be able to remove role from group', () => {
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();

    cy.get(
      `[data-cy="RoleListTable-ExpandableRow-row-${testRole.name}"] [data-cy="kebab-toggle"]`,
    ).click();
    cy.contains('Remove Role').click();

    cy.get('[data-cy="delete-button"]').contains('Delete').click();
  });

  it('should not display deleted role in group detail', () => {
    cy.addRolesToGroup(groupName, [testContainerRole.name]);
    cy.deleteRole(testContainerRole.name);

    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.get('[data-cy="EmptyState"]')
      .contains(testContainerRole.name)
      .should('not.exist');
  });

  it('should show group empty state', () => {
    cy.createGroup('empty_group');
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-empty_group"] a`).click();
    cy.contains('There are currently no roles assigned to this group.');
  });
});
