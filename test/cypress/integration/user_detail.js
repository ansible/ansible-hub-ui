describe('user detail tests all fields, editing, and deleting', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let num = (~~(Math.random() * 1000000)).toString();

  let selectInput = (id) => {
    return cy.get(`input[id=${id}]`).click();
  };

  let selectField = (label) => {
    return cy.get(`[aria-labelledby=${label}] > .pf-c-form__group-control`);
  };

  let deleteTestGroup = () => {
    cy.visit('/ui/groups');
    cy.contains(`testGroup${num}`).click();
    cy.contains('Delete').click();
    cy.get('button').contains('Delete').click();
  };

  let buildUserProfile = () => {
    cy.createGroup(`testGroup${num}`);
    cy.galaxykit('user create', 'testUser', 'testUserpassword');
    cy.addPermissions('testGroup', [
      { group: 'users', permissions: ['View user'] },
    ]);
    cy.addUserToGroup('testGroup', 'testUser');
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
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    deleteTestGroup();
    buildUserProfile();
  });

  it('checks all fields', () => {
    cy.visit('/ui/users');
    cy.contains('testUser').click();
    selectField('username').should('have.text', 'testUser');
    selectField('first_name').should('have.text', 'first_name');
    selectField('last_name').should('have.text', 'last_name');
    selectField('email').should('have.text', 'example@example.com');
    selectField('readonly-groups').should('have.text', 'testGroup');
    cy.get('.pf-c-switch > .pf-c-switch__label').should(
      'have.text',
      'Super userNot a super user',
    );
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
    cy.contains('testUser').click();
    selectField('first_name').should('have.text', 'new_first_name');
    selectField('last_name').should('have.text', 'new_last_name');
    selectField('email').should('have.text', 'new_example@example.com');
  });

  it('deletes user', () => {
    cy.visit('/ui/users');
    cy.contains('testUser').click();
    cy.contains('Delete').click();
    cy.get('button').contains('Delete').click();

    cy.contains('testUser').should('not.exist');
    // looks like we need a success alert deleting user from user_detail?
    // cy.get('.pf-c-alert__title').should('have.text', 'Successfully deleted testUser')
  });

  it('checks a user without edit permissions', () => {
    cy.logout();
    cy.login('testUser', 'testUserpassword');
    cy.visit('/ui/users/?username=testUser');
    cy.get('a[href*="/ui/users/"]').click();
    cy.contains('User detail');
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });
});
