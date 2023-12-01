const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('user detail tests all fields, editing, and deleting', () => {
  const num = (~~(Math.random() * 1000000)).toString();

  const selectInput = (id) => cy.get(`input[id=${id}]`).click().clear();

  before(() => {
    cy.galaxykit('group create', `alphaGroup${num}`);
    cy.galaxykit('user create', 'testUser', 'testUserpassword');
    cy.galaxykit('user group add', 'testUser', `alphaGroup${num}`);
  });

  beforeEach(() => {
    cy.login();
  });

  it('checks all fields', () => {
    cy.visit(`${uiPrefix}users`);
    cy.contains('testUser').click();
    cy.contains('Edit').click();
    selectInput('first_name').type('first_name');
    selectInput('last_name').type('last_name');
    selectInput('email').type('example@example.com');
    cy.get('button[type=submit]').click();

    cy.visit(`${uiPrefix}users`);
    cy.intercept('GET', `${apiPrefix}_ui/v1/users/*/`).as('testUser');
    cy.contains('testUser').click();
    cy.wait('@testUser');

    cy.get('[data-cy="DataForm-field-username"]').contains('testUser');
    cy.get('[data-cy="DataForm-field-first_name"]').contains('first_name');
    cy.get('[data-cy="DataForm-field-last_name"]').contains('last_name');
    cy.get('[data-cy="DataForm-field-email"]').contains('example@example.com');
    cy.get('[data-cy="UserForm-readonly-groups"]').contains(`alphaGroup${num}`);
  });

  it('edits user', () => {
    cy.visit(`${uiPrefix}users`);
    cy.contains('testUser').click();
    //edits some fields
    cy.contains('Edit').click();
    selectInput('first_name').type('new_first_name');
    selectInput('last_name').type('new_last_name');
    selectInput('email').type('new_example@example.com');
    cy.get('button[type=submit]').click();
    cy.reload();
    //checks those fields
    cy.visit(`${uiPrefix}users`);
    cy.intercept('GET', `${apiPrefix}_ui/v1/users/*/`).as('user');
    cy.contains('testUser').click();
    cy.wait('@user');
    cy.get('[data-cy="DataForm-field-first_name"]').contains('new_first_name');
    cy.get('[data-cy="DataForm-field-last_name"]').contains('new_last_name');
    cy.get('[data-cy="DataForm-field-email"]').contains(
      'new_example@example.com',
    );
  });

  it('deletes user', () => {
    cy.visit(`${uiPrefix}users`);
    cy.contains('testUser').click();
    cy.contains('Delete').click();
    cy.get('[data-cy="delete-button"]').click();

    cy.contains('testUser').should('not.exist');
  });
});
