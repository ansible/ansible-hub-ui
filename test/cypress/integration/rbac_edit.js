describe('edits a role', () => {
  let num = (~~(Math.random() * 1000000)).toString();
  before(() => {
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

    // edit role

    cy.get('[aria-label="Actions"]:first').click();
    cy.contains('Edit').click();
    cy.get('input[id="role_name"]').should('be.disabled');
    cy.get('input[id="role_description"]').clear().type('new description');

    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click(); // add permission 'Change namespace'
    cy.contains('Save').click();

    // check list view

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
