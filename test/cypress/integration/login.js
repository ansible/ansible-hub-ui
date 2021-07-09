describe('Test login for cookie storage', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'nopermission';
  let password = 'n0permissi0n';

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.createUser(username, password);
    cy.logout();
  });

  afterEach(() => {
    cy.deleteUser(username);
    cy.logout();
  });

  it('Test manual login and logout as admin or different user', () => {
    cy.visit(baseUrl);
    cy.manual_login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.manual_logout();
    cy.manual_login(username, password);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.manual_logout();
    cy.manual_login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.manual_logout();
    cy.manual_login(username, password);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.manual_logout();
    cy.manual_login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains('Collections');
  });

  it('Test login without logout as admin or different user', () => {
    cy.visit(baseUrl);
    cy.login(username, password);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.logout();
    cy.login(username, password);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.login(adminUsername, adminPassword);
    cy.visit(baseUrl);
    cy.contains('Collections');
    cy.login(username, password);
    cy.visit(baseUrl);
    cy.contains('Collections');
  });
});
