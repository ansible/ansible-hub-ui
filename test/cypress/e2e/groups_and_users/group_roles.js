describe('Group Roles Tests', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  const groupName = `test_group_${num}`;

  const testRole = {
    name: `galaxy.test_role_${num}`,
    description: 'test role for test group',
    permissions: {
      'galaxy.add_group': 'Add group',
      'galaxy.change_group': 'Change group',
      'galaxy.delete_group': 'Delete group',
      'galaxy.view_group': 'View group',
      'galaxy.add_namespace': 'Add namespace',
      'galaxy.delete_namespace': 'Delete namespace',
    },
  };

  const testContainerRole = {
    name: `galaxy.test_container_role_${num}`,
    description: 'this is test container role',
    permissions: {
      'container.namespace_change_containerdistribution': 'Change containers',
      'container.namespace_modify_content_containerpushrepository':
        'Change image tags',
      'container.delete_containerrepository': 'Delete container repository',
    },
  };

  beforeEach(() => {
    cy.login();
  });

  before(() => {
    cy.login();
    cy.galaxykit('-i group create', groupName);
    cy.createRole(
      testContainerRole.name,
      testContainerRole.description,
      Object.keys(testContainerRole.permissions),
    );
  });

  after(() => {
    cy.galaxykit('group delete', groupName);
    cy.galaxykit('group delete', 'empty_group');
    cy.galaxykit('role delete', testRole.name);
  });

  it('should add a new role to group', () => {
    cy.createRole(
      testRole.name,
      testRole.description,
      Object.keys(testRole.permissions),
    );

    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/groups/*').as('groups');
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.wait('@groups');
    cy.get('[data-cy=add-roles]').click();

    cy.get('[aria-label="Items per page"]').click();
    cy.contains('100 per page').click();

    cy.get(`[data-cy="RoleListTable-CheckboxRow-row-${testRole.name}"]`)
      .find('input')
      .click();

    cy.get('.pf-c-wizard__footer > button').contains('Next').click();

    cy.contains(testRole.name);

    cy.get('.pf-c-wizard__footer > button').contains('Add').click();

    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.get('[data-cy="RoleListTable"]').contains(testRole.name);
    cy.get(
      `[data-cy="RoleListTable-ExpandableRow-row-${testRole.name}"] .pf-c-table__toggle`,
    ).click();

    cy.contains('1 more').click();
    Object.values(testRole.permissions).forEach((perm) => {
      cy.contains(perm);
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
    cy.get('.pf-c-dropdown__menu-item').contains('Remove role').click();

    cy.get('[data-cy="delete-button"]').contains('Delete').click();
  });

  it('should not display deleted role in group detail', () => {
    cy.galaxykit('group role add', groupName, testContainerRole.name);
    cy.galaxykit('role delete', testContainerRole.name);

    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.get('[data-cy="EmptyState"]')
      .contains(testContainerRole.name)
      .should('not.exist');
  });

  it('should show group empty state', () => {
    cy.galaxykit('-i group create', 'empty_group');
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-empty_group"] a`).click();
    cy.contains('There are currently no roles assigned to this group.');
  });
});
