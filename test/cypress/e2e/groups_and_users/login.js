const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

// integrated standalone-mode login screen
const manualLogin = (username, password) => {
  cy.intercept('POST', `${apiPrefix}_ui/v1/auth/login/`).as('login');
  cy.intercept('GET', `${apiPrefix}_ui/v1/feature-flags/`).as('feature-flags');

  cy.visit(`${uiPrefix}login`);
  cy.get('#pf-login-username-id').type(username);
  cy.get('#pf-login-password-id').type(`${password}{enter}`);

  cy.wait('@login');
  cy.wait('@feature-flags');
};

const manualLogout = () => {
  cy.intercept('GET', `${apiPrefix}_ui/v1/feature-flags/`).as('feature-flags');

  cy.get('[aria-label="user-dropdown"] button').click();
  cy.get('[aria-label="logout"]').click();

  cy.wait('@feature-flags');
};

describe('Login helpers', () => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');
  const username = 'nopermission';
  const password = 'n0permissi0n';

  before(() => {
    cy.deleteTestUsers();

    cy.galaxykit('user create', username, password);
  });

  it('can login manually and logout as admin or different user', () => {
    manualLogin(username, password);
    cy.contains(username);
    manualLogout();
    manualLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });

  it('can use api login', () => {
    cy.login();
    cy.contains(adminUsername);

    cy.login(username, password);
    cy.contains(username);
  });
});
