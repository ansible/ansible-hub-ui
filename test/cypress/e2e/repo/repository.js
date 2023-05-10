const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Repository', () => {
  before(() => {
    cy.deleteRepositories();
  });

  beforeEach(() => {
    cy.visit(uiPrefix);
    cy.login();
  });

  it('checks for empty state', () => {});
});
