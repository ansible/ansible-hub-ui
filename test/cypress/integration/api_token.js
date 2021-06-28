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

  it('token is generated', () => {
    cy.menuGo('Collections > API Token');
    cy.contains('Load token').click();

    cy.get('[aria-label="Copyable input"]')
      .invoke('val')
      .should('match', /[0-9a-f]{40}?/);

    /*cy.get('[aria-label="Copyable input"]').invoke('val').then( (input) =>
    {
        debugger;
        expect(input).to.have.lengthOf(40);
    });*/

    /*<input id="text-input-0" aria-label="Copyable input" class="pf-c-form-control" type="text" aria-invalid="false" value="8076f80c308a29135979d349640ecd1e7c80400f">*/
  });
});
