describe('edits a role', () => {
  const num = (~~(Math.random() * 1000000)).toString();

  beforeEach(() => {
    cy.login();
    cy.menuGo('User Access > Roles');
  });

  it('edits a role', () => {
    // create role

    cy.contains('Add roles').click();
    cy.get('input[id="role_name"]').type(`galaxy.test${num}`);
    cy.get('input[id="role_description"]').type('test description');

    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click(); // add permission 'Add namespace'
    cy.contains('Save').click();

    // edit role - first filter by editable and name fragment

    cy.get('[data-cy=compound_filter] > div:nth-child(1) > button').click();
    cy.get('[data-cy=compound_filter] [role=menuitem]')
      .contains('Editable')
      .click();
    cy.get('[data-cy=compound_filter] > div:nth-child(2) > button').click();
    cy.get('[data-cy=compound_filter] [role=menuitem]')
      .contains('Editable')
      .click();

    cy.get('[data-cy=compound_filter] > div:nth-child(1) > button').click();
    cy.get('[data-cy=compound_filter] [role=menuitem]')
      .contains('Role name')
      .click();
    cy.get(
      '[data-cy=compound_filter] input[aria-label="name__icontains"]',
    ).type(`test${num}{enter}`);

    cy.get('[aria-label="Actions"]:first').click();
    cy.get('[role=menuitem]').contains('Edit').click();

    cy.get('input[id="role_name"]').should('be.disabled');
    cy.get('input[id="role_description"]').clear().type('new description');

    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click(); // add permission 'Change namespace'
    cy.contains('Save').click();

    // check list view

    cy.get(
      '[data-cy=compound_filter] input[aria-label="name__icontains"]',
    ).type(`test${num}{enter}`);

    cy.get('tbody > tr > td').eq(2).contains('new description');
    cy.get('[aria-label="Details"]:first').click();
    cy.contains('Add namespace');
    cy.contains('Change namespace');

    // cleanup - delete role

    cy.get('[aria-label="Actions"]:first').click();
    cy.contains('Delete').click();
    cy.get('button').contains('Delete').click();
  });
});
