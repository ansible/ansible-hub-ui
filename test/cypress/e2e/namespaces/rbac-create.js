const helperText = (id) =>
  cy
    .get(`#${id}`)
    .parents('.pf-v5-c-form__group')
    .find('.pf-v5-c-helper-text__item-text');

describe('add and delete roles', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  before(() => {
    cy.login();
    cy.menuGo('User Access > Roles');
  });

  it('adds a new role', () => {
    cy.contains('Add roles').click();

    // checks role name input

    cy.get('#role_name').type('a');
    helperText('role_name').should(
      'have.text',
      'This field must be longer than 2 characters',
    );
    cy.contains('Save').should('be.disabled');

    cy.get('#role_name').clear().type('[');
    helperText('role_name').should(
      'have.text',
      'This field can only contain letters and numbers',
    );
    cy.contains('Save').should('be.disabled');

    cy.get('#role_name').clear().type('test');
    helperText('role_name').should(
      'have.text',
      "This field must start with 'galaxy.'.",
    );

    cy.get('#role_name').clear();
    helperText('role_name').should('have.text', 'This field may not be blank.');
    cy.contains('Save').should('be.disabled');

    cy.get('#role_name').clear().type(`galaxy.test${num}`);
    cy.contains('Save').should('be.enabled');

    // checks role description input

    cy.get('#role_description').type('a');
    helperText('role_description').should(
      'have.text',
      'This field must be longer than 2 characters',
    );
    cy.contains('Save').should('be.disabled');

    cy.get('#role_description').clear();
    helperText('role_description').should(
      'have.text',
      'This field may not be blank.',
    );
    cy.contains('Save').should('be.disabled');

    cy.get('#role_description').clear().type('test description');
    cy.contains('Save').should('be.enabled');

    // add permissions

    cy.contains('Collection Namespaces')
      .parent()
      .find('input', 'Select Permissions')
      .click();
    cy.get('ul[role="listbox"] > li:first').click();

    cy.contains('Save').click();

    // check list view, use filter

    cy.get('[data-cy=compound_filter] input').type('test{enter}');

    cy.get('tbody').contains(`galaxy.test${num}`);
    cy.get('[aria-label="Details"]:first').click();
    cy.contains('Add namespace');

    // delete role

    cy.get('[aria-label="Actions"]:first').click();
    cy.contains('Delete').click();
    cy.get('button').contains('Delete').click();
    cy.get('.pf-v5-c-alert__action').click();
    cy.contains(`galaxy.test${num}`).should('not.exist');
  });
});
