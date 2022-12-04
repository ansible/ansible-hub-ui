const uiPrefix = Cypress.env('uiPrefix');

describe('Collections list', () => {
  beforeEach(() => {
    cy.visit(uiPrefix);

    cy.contains('Sign in to your account');
    cy.screenshot();
    cy.get('input#username').type('admin');
    cy.get('input#password').type('admin{enter}');

    cy.contains('.pf-c-title', 'Collections');
    cy.screenshot();
  });

  it('lists collections', () => {
    cy.galaxykit('collection upload');
    cy.galaxykit('collection list');
  });
});
