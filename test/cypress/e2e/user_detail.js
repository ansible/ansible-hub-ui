describe('user detail tests all fields, editing, and deleting', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let num = (~~(Math.random() * 1000000)).toString();

  let selectInput = (id) => {
    return cy.get(`input[id=${id}]`).click();
  };

  let deleteTestGroup = () => {
    cy.intercept('GET', Cypress.env('prefix') + `ui/group-list`).as('groups');
    cy.visit('/ui/group-list');
    cy.wait('@groups');
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/groups/*/model-permissions/?limit=100000&offset=0',
    ).as('testGroup');
    cy.contains(`alphaGroup${num}`).click();
    cy.wait('@testGroup');
    cy.get('button').contains('Delete').click();
    cy.get('[data-cy="delete-button"]').click();
  };

  let buildUserProfile = () => {
    cy.createGroup(`alphaGroup${num}`);
    cy.galaxykit('user create', 'testUser', 'testUserpassword');
    cy.addPermissions(`alphaGroup${num}`, [
      { group: 'users', permissions: ['View user'] },
    ]);
    cy.addUserToGroup(`alphaGroup${num}`, 'testUser');
    cy.visit('/ui/users');
    cy.contains('testUser').click();
    cy.contains('Edit').click();
    selectInput('first_name').click().clear().type('first_name');
    selectInput('last_name').click().clear().type('last_name');
    selectInput('email').click().clear().type('example@example.com');
    cy.get('button[type=submit]').click();
    cy.reload();
  };

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.login(adminUsername, adminPassword);
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
  });

  it('checks all fields', () => {
    buildUserProfile();
    cy.visit('/ui/users');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/users/*/').as(
      'testUser',
    );
    cy.contains('testUser').click();
    cy.wait('@testUser');
    cy.get('[data-cy="DataForm-field-username"]').contains('testUser');
    cy.get('[data-cy="DataForm-field-first_name"]').contains('first_name');
    cy.get('[data-cy="DataForm-field-last_name"]').contains('last_name');
    cy.get('[data-cy="DataForm-field-email"]').contains('example@example.com');
    cy.get('[data-cy="UserForm-readonly-groups"]').contains(`alphaGroup${num}`);
    cy.get('.pf-c-switch > .pf-c-switch__label').should(
      'have.text',
      'Super userNot a super user',
    );
    deleteTestGroup();
  });

  it('edits user', () => {
    cy.visit('/ui/users');
    cy.contains('testUser').click();
    //edits some fields
    cy.contains('Edit').click();
    selectInput('first_name').click().clear().type('new_first_name');
    selectInput('last_name').click().clear().type('new_last_name');
    selectInput('email').click().clear().type('new_example@example.com');
    cy.get('button[type=submit]').click();
    cy.reload();
    //checks those fields
    cy.visit('/ui/users');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/users/*/').as('user');
    cy.contains('testUser').click();
    cy.wait('@user');
    cy.get('[data-cy="DataForm-field-first_name"]').contains('new_first_name');
    cy.get('[data-cy="DataForm-field-last_name"]').contains('new_last_name');
    cy.get('[data-cy="DataForm-field-email"]').contains(
      'new_example@example.com',
    );
  });

  it('deletes user', () => {
    cy.visit('/ui/users');
    cy.contains('testUser').click();
    cy.contains('Delete').click();
    cy.get('[data-cy="delete-button"]').click();

    cy.contains('testUser').should('not.exist');
    // looks like we need a success alert deleting user from user_detail?
    // cy.get('.pf-c-alert__title').should('have.text', 'Successfully deleted testUser')
  });

  it.skip('checks a user without edit permissions', () => {
    cy.logout();
    cy.get('input[id="pf-login-username-id"]').type('testUser');
    cy.get('input[id="pf-login-password-id"]').type('testUserpassword');
    cy.get('button[type="submit"]').click();
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/repo/published/?deprecated=false&offset=0&limit=10',
    );

    //unable to log in with test credentials

    cy.get('a[href*="/ui/users/"]').click();
    cy.contains('User detail');
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });
});
