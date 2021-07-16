describe('Test cookieLogin for cookie storage', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'nopermission';
  let password = 'n0permissi0n';

  before(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.deleteTestUsers();
    cy.galaxykit('user create', username, password);
    cy.logout();
  });

  it('Test manual login and logout as admin or different user', () => {
    cy.visit(baseUrl);
    cy.login(username, password);
    cy.visit(baseUrl);
    cy.contains(username);
    cy.logout();
    cy.login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
    cy.logout();
  });

  it('Test login1 user', () => {
    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);
  });

  it('Test login2 admin', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
  });

  it('Test login3 user', () => {
    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);
  });

  it('Test login4 admin', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
  });

  it('Test cookieLogin without logout and cookie removal as admin or different user', () => {
    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);

    cy.cookieLogin(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains(adminUsername);

    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);

    cy.cookieLogin(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
  });

  it('Test cookieLogin with logout and cookie removal as admin or different user', () => {
    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);
    cy.cookieLogout();

    cy.cookieLogin(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
    cy.cookieLogout();

    cy.cookieLogin(username, password);
    cy.visit(baseUrl);
    cy.contains(username);
    cy.cookieLogout();

    cy.cookieLogin(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains(adminUsername);
    cy.cookieLogout();
  });
});
