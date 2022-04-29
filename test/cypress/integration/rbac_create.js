describe('add and delete roles', () => {
  let num = (~~(Math.random() * 1000000)).toString();
  before(() => {
    cy.login();
    cy.menuGo('User Access > Roles');
  });

  it('adds a new role', () => {
    cy.contains('Add roles').click();

    //checks role name input

    cy.get('input[id="role_name"]').type('a');

    cy.get('[id="name-helper"]').should(
      'have.text',
      'This field must be longer than 2 characters',
    );
    cy.contains('Save').should('be.disabled');
    cy.get('input[id="role_name"]').clear().type('[');
    cy.get('[id="name-helper"]').should(
      'have.text',
      'This field can only contain letters and numbers',
    );
    cy.contains('Save').should('be.disabled');
    cy.get('input[id="role_name"]').clear().type('test');
    cy.get('[id="name-helper"]').should(
      'have.text',
      `This field must start with 'galaxy.'.`,
    );
    cy.get('input[id="role_name"]').clear();
    cy.get('[id="name-helper"]').should(
      'have.text',
      'This field may not be blank.',
    );
    cy.contains('Save').should('be.disabled');
    cy.get('input[id="role_name"]').clear().type(`galaxy.test${num}`);
    cy.contains('Save').should('be.enabled');

    //checks role description input

    cy.get('input[id="role_description"]').type('a');

    cy.get('[id="description-helper"]').should(
      'have.text',
      'This field must be longer than 2 characters',
    );
    cy.contains('Save').should('be.disabled');

    cy.get('input[id="role_description"]').clear();
    cy.get('[id="description-helper"]').should(
      'have.text',
      'This field may not be blank.',
    );
    cy.contains('Save').should('be.disabled');
    cy.get('input[id="role_description"]').clear().type('test description');
    cy.contains('Save').should('be.enabled');

    // add permissions

    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click();

    cy.contains('Save').click();

    //check list view

    cy.get('tbody').contains(`galaxy.test${num}`);
    cy.get('[aria-label="Details"]:first').click();
    cy.contains('Add namespace');

    //delete role

    cy.get('[aria-label="Actions"]:first').click();
    cy.contains('Delete').click();
    cy.get('button').contains('Delete').click();
    cy.get('.pf-c-alert__action').click();
    cy.contains(`galaxy.test${num}`).should('not.exist');
  });
});
