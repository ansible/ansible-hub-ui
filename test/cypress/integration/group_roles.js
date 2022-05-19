describe('add roles to a group', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  const groupName = 'test_group_627477'; // `test_group_${num}`;
  const roleName = 'galaxy.test_role_627477'; // `galaxy.test_role_${num}`

  beforeEach(() => {
    cy.login();
  });

  it('adds a new role to group', () => {
    // create role
    cy.menuGo('User Access > Roles');
    cy.contains('Add roles').click();
    cy.get('input[id="role_name"]').type(`galaxy.alpha${num}`);
    cy.get('input[id="role_description"]').type('test description');
    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click();
    cy.get('button').contains('Save').click();

    // create new group

    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/groups/?sort=name&offset=0&limit=10',
    ).as('loadGroups');
    cy.menuGo('User Access > Groups');
    cy.wait('@loadGroups');
    cy.get('button').contains('Create').click();
    cy.get('input[id="group_name"]').type(`test group${num}`);

    cy.intercept('POST', Cypress.env('prefix') + '_ui/v1/groups/').as(
      'createGroup',
    );

    cy.get('[data-cy="create-group-button"]').contains('Create').click();

    cy.wait('@createGroup');

    // add roles

    cy.contains('Add roles').click();
    cy.get('td')
      .contains(`galaxy.alpha${num}`)
      .siblings('.pf-c-table__check')
      .click();
    cy.get('button').contains('Next').click();
    cy.contains(`galaxy.alpha${num} - test description`);
    cy.get('button[type="submit"]').contains('Add').click();

    // check group detail page for added roles/permissions.
    cy.get('button[aria-label="Details"]').click();
    cy.contains('Add namespace');

    // delete role (cleanup)
    cy.menuGo('User Access > Roles');
    cy.get('[data-cy=compound_filter] input[aria-label=name__icontains]').type(
      `alpha${num}{enter}`,
    );
    cy.get(`[data-cy=RoleListTable] tr`)
      .contains(`galaxy.alpha${num}`)
      .parent('tr')
      .find('[data-cy=kebab-toggle]')
      .click();
    cy.get('.pf-c-dropdown__menu-item').contains('Delete').click();
    cy.get(`[data-cy=delete-button]`).click();
  });

  after(() => {
    // cy.galaxykit("group delete", groupName);
    // cy.deleteRole(roleName);
  });

  // it('should add a new role to group', () => {
  //   const permissions = [
  //     {
  //       group: 'groups',
  //       permissions: [
  //         'Add group',
  //         'Change group',
  //         'Delete group',
  //         'View group',
  //       ],
  //     },
  //     {
  //       group: 'namespaces',
  //       permissions: ['Add namespace', 'Delete namespace']
  //     },
  //   ]
  //   // cy.createRole(roleName, 'test role for test group', permissions);
  //   // cy.createGroup(groupName);
  //   // cy.addRolesToGroup(groupName, [roleName]);

  //   cy.visit('/ui/group/59');
  //   cy.get('[data-cy="RoleListTable"]').contains(roleName);
  //   cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${roleName}"] .pf-c-table__toggle`).click();

  //   cy.contains('1 more').click();
  //   permissions.forEach(({ permissions }) => {
  //     permissions.forEach(perm => {
  //       cy.contains(perm)
  //     })
  //   })
  // });

  it('test Add roles modal', () => {
    cy.visit('/ui/group/59');
    cy.get('[data-cy=add-roles]').click();
  });

  // TODO
  //it('test filtering in group roles')

  // it('test for already added role')

  // it('should be able to remove role from group', () => {
  //   cy.visit('/ui/group/59');
  //   cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${roleName}"] [data-cy="kebab-toggle"]`).click();
  //   cy.contains('Remove Role').click();
  //   cy.get('[data-cy="DeleteModal"]').parent().click();
  // });
});
