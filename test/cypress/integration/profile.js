describe('My Profile Tests', () => {
  const username = 'nopermission';
  const password = 'n0permissi0n';

  before(() => {
    cy.deleteTestUsers();
    cy.galaxykit('user create', username, password);
  });

  beforeEach(() => {
    cy.login();
    // open the dropdown labeled with the username and then...
    cy.get('[aria-label="user-dropdown"] button').click();
    // a little hacky, but basically
    // just click the one link that says 'My profile'.
    cy.get('a').contains('My profile').click();
    cy.get('button:contains("Edit")').click();
  });

  it('only has input fields for name, email, username, password and pass confirmation', () => {
    let inputs = [
      'first_name',
      'last_name',
      'email',
      'username',
      'password',
      'password-confirm',
    ];
    cy.get('.body').within(() => {
      // restricted to text input types because there's a checkbox now for the
      // 'super user' option, but it's disabled.
      cy.get('input[type="text"]').each(($el) => {
        expect(inputs).to.include($el.attr('id'));
      });
    });
  });

  it('superuser cannot change its superuser rights', () => {
    cy.get('.pf-c-switch__input').should('be.disabled');
  });

  it('user cannot set superusers rights', () => {
    cy.login(username, password);

    cy.get('[aria-label="user-dropdown"] button').click();
    cy.get('a').contains('My profile').click();

    cy.get('.pf-c-switch__input').should('be.disabled');
  });

  it('email must be email', () => {
    cy.login(username, password);

    cy.get('[aria-label="user-dropdown"] button').click();
    cy.get('a').contains('My profile').click();
    cy.get('button:contains("Edit")').click();

    cy.get('#email').clear().type('test{enter}');
    cy.get('#email-helper').should('contain', 'Enter a valid email address.');

    cy.get('#email').type('@example');
    cy.get('#email-helper').should('contain', 'Enter a valid email address.');

    cy.get('#email').type('.com{enter}');

    cy.get('[aria-label="Success Alert"]').should('be.visible');
  });

  it('password validations', () => {
    cy.login(username, password);

    cy.get('[aria-label="user-dropdown"] button').click();
    cy.get('a').contains('My profile').click();
    cy.get('button:contains("Edit")').click();

    cy.get('#password').clear().type('12345');
    cy.get('#password-confirm').clear().type('12345');
    cy.contains('Save').click();
    cy.get('#password-helper').contains('This password is entirely numeric.');

    cy.get('#password').clear().type('pwd12345');
    cy.get('#password-confirm').clear().type('pwd12345');
    cy.contains('Save').click();
    cy.get('#password-helper').contains(
      'This password is too short. It must contain at least 9 characters.',
    );

    cy.get('#password-confirm').clear().type('pwd123456');
    cy.get('#password-confirm-helper').should(
      'contain',
      'Passwords do not match',
    );

    cy.get('#password').clear().type(password);
    cy.get('#password-confirm').clear().type(password);

    cy.get('#password-confirm-helper').should('not.exist');
  });

  it('groups input is readonly', () => {
    cy.get('[data-cy="UserForm-readonly-groups"]')
      .find('input')
      .should('not.exist');
  });

  it('user can save form', () => {
    cy.intercept('PUT', Cypress.env('prefix') + '_ui/v1/me/').as('saveForm');

    cy.contains('Save').click();
    cy.get('[aria-label="Success Alert"]').contains(
      'Saved changes to user "admin".',
    );

    cy.wait('@saveForm').its('response.statusCode').should('eq', 200);

    cy.get('[aria-label="Success Alert"]').contains(
      'Saved changes to user "admin".',
    );
  });

  it('user can cancel form', () => {
    cy.get('#username').clear().type('administrator');
    cy.get('#first_name').clear().type('First Name');
    cy.get('#last_name').clear().type('Last Name');
    cy.get('#email').clear().type('administrator@example.com');

    cy.get('.pf-c-button').contains('Cancel').click();

    cy.get('[data-cy="DataForm-field-username"]').should(
      'not.contain',
      'administrator',
    );
    cy.get('[data-cy="DataForm-field-first_name"]').should(
      'not.contain',
      'First Name',
    );
    cy.get('[data-cy="DataForm-field-last_name"]').should(
      'not.contain',
      'Last Name',
    );
    cy.get('[data-cy="DataForm-field-email"]').should(
      'not.contain',
      'administrator@example.com',
    );
  });
});
