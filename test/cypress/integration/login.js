describe('Login helpers', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'nopermission';
  let password = 'n0permissi0n';

  before(() => {
    cy.deleteTestUsers();
    cy.cookieReset();

    cy.galaxykit('user create', username, password);
  });

  it('can login manually and logout as admin or different user', () => {
    cy.login(username, password);
    cy.contains(username);
    cy.logout();
    cy.login(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });

  it('can login as user and store cookie', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);
  });

  it('can login as admin and store cookie', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.contains(adminUsername);
  });

  it('it can switch back to user using cookie storage', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);
  });

  it('it can switch back to admin using cookie storage', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.contains(adminUsername);
  });

  it('can cookieLogin without cookie removal between its as admin or different user', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);

    cy.cookieLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });
});
