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
    // prevent blowing up on unauthenticated requests on the login page
    cy.on('uncaught:exception', () => false);

    cy.manualLogin(username, password);
    cy.contains(username);
    cy.logout();
    cy.manualLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });

  it('can use apiLogin', () => {
    // prevent blowing up on unauthenticated requests on the login page
    cy.on('uncaught:exception', () => false);

    cy.apiLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);

    cy.apiLogin(username, password);
    cy.contains(username);
  });
});
