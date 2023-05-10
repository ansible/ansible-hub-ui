const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Repository', () => {
  before(() => {});

  beforeEach(() => {
    cy.visit(uiPrefix);
    cy.login();
  });

  it('checks for empty state', () => {});
});
