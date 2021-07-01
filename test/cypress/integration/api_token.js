describe('API Token Tests', () => {
  let urljoin = require('url-join');
  var baseUrl = Cypress.config().baseUrl;
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  let apiUrl = urljoin(baseUrl, 'ui/token');

  before(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('sessionid', 'csrftoken');
    cy.visit(baseUrl);
    cy.server();
  });

  it('token is generated', () => {
    cy.menuGo('Collections > API Token');
    cy.contains('Load token').click();

    cy.get('[aria-label="Copyable input"]')
      .invoke('val')
      .should('match', /[0-9a-f]{40}?/);
  });
});
