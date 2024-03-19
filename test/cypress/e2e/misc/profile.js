const apiPrefix = Cypress.env('apiPrefix');

const helperText = (id) =>
  cy
    .get(`#${id}`)
    .parents('.pf-v5-c-form__group')
    .find('.pf-v5-c-helper-text__item-text');

describe('My Profile Tests', () => {
  const username = 'nopermission';
  const password = 'n0permissi0n';

  before(() => {
    cy.deleteTestUsers();
    cy.galaxykit('user create', username, password);
  });

  beforeEach(() => {
    cy.login();
    cy.get('[data-cy="user-dropdown"] button').click();
    cy.contains('a', 'My profile').click();
    cy.contains('button', 'Edit').click();
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
    cy.get('.pf-v5-c-switch__input').should('be.disabled');
  });

  it('user cannot set superusers rights', () => {
    cy.login(username, password);

    cy.get('[data-cy="user-dropdown"] button').click();
    cy.contains('a', 'My profile').click();
    cy.contains('button', 'Edit').click();

    cy.get('.pf-v5-c-switch__input').should('be.disabled');
  });

  it('email must be email', () => {
    cy.login(username, password);

    cy.get('[data-cy="user-dropdown"] button').click();
    cy.get('a').contains('My profile').click();
    cy.get('button:contains("Edit")').click();

    cy.get('#email').clear().type('test{enter}');
    helperText('email').should('contain', 'Enter a valid email address.');

    cy.get('#email').type('@example');
    helperText('email').should('contain', 'Enter a valid email address.');

    cy.get('#email').type('.com{enter}');

    cy.get('.pf-v5-c-alert.pf-m-success').should('be.visible');
  });

  it('password validations', () => {
    cy.login(username, password);

    cy.get('[data-cy="user-dropdown"] button').click();
    cy.get('a').contains('My profile').click();
    cy.get('button:contains("Edit")').click();

    cy.get('#password').clear().type('12345');
    cy.get('#password-confirm').clear().type('12345');
    cy.contains('Save').click();
    helperText('password').contains('This password is entirely numeric.');

    cy.get('#password').clear().type('pwd12345');
    cy.get('#password-confirm').clear().type('pwd12345');
    cy.contains('Save').click();
    helperText('password').contains(
      'This password is too short. It must contain at least 9 characters.',
    );

    cy.get('#password-confirm').clear().type('pwd123456');
    helperText('password-confirm').should('contain', 'Passwords do not match');

    cy.get('#password').clear().type(password);
    cy.get('#password-confirm').clear().type(password);
    helperText('password-confirm').should('be.empty');
  });

  it('groups input is readonly', () => {
    cy.get('[data-cy="UserForm-readonly-groups"]').should('not.exist');
  });

  it('user can save form', () => {
    cy.intercept('PUT', `${apiPrefix}_ui/v1/me/`).as('saveForm');

    cy.contains('Save').click();
    cy.get('.pf-v5-c-alert.pf-m-success').contains(
      'Saved changes to user "admin".',
    );

    cy.wait('@saveForm').its('response.statusCode').should('eq', 200);

    cy.get('.pf-v5-c-alert.pf-m-success').contains(
      'Saved changes to user "admin".',
    );
  });

  it('user can cancel form', () => {
    cy.get('#username').clear().type('administrator');
    cy.get('#first_name').clear().type('First Name');
    cy.get('#last_name').clear().type('Last Name');
    cy.get('#email').clear().type('administrator@example.com');

    cy.get('.pf-v5-c-button').contains('Cancel').click();

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
