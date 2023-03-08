const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('user detail tests all fields, editing, and deleting', () => {
  const num = (~~(Math.random() * 1000000)).toString();

  const selectInput = (id) => cy.get(`input[id=${id}]`).click().clear();

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();

    cy.galaxykit('group create', `alphaGroup${num}`);
    cy.galaxykit('user create', 'testUser', 'testUserpassword');
    cy.galaxykit('user group add', 'testUser', `alphaGroup${num}`);
  });

  after(() => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
  });

  beforeEach(() => {
    cy.login();
  });

  it('checks all fields', () => {
    // FIXME
    //cy.addPermissions(`alphaGroup${num}`, [
    //  { group: 'users', permissions: ['View user'] },
    //]);

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
    // FIXME test the right value, not both
    cy.get('.pf-c-switch > .pf-c-switch__label').should(
      'have.text',
      'Super userNot a super user',
    );
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
    // looks like we need a success alert deleting user from user_detail?
    // cy.get('.pf-c-alert__title').should('have.text', 'Successfully deleted testUser')
  });

  it.skip('checks a user without edit permissions', () => {
    // cy.logout();
    cy.get('input[id="pf-login-username-id"]').type('testUser');
    cy.get('input[id="pf-login-password-id"]').type('testUserpassword');
    cy.get('button[type="submit"]').click();
    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/repo/published/?deprecated=false&offset=0&limit=10`,
    );

    //unable to log in with test credentials

    cy.get(`a[href*="${uiPrefix}users/"]`).click();
    cy.contains('User detail');
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });
});
