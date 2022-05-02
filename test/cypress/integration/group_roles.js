describe('add roles to a group', () => {
  let num = (~~(Math.random() * 1000000)).toString();
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
    cy.intercept(
      'GET',
      'http://localhost:8002/pulp/api/v3/roles/?name__startswith=galaxy.&offset=0&limit=10',
    ).as('loadGroup');
    cy.get('[data-cy="create-group-button"]').contains('Create').click();
    cy.wait('@createGroup');
    cy.wait('@loadGroup');

    // add roles

    cy.get('button').contains('Add roles').click();
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
  });
});
