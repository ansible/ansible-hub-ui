const uiPrefix = Cypress.env('uiPrefix');

describe('view-only mode - without download', () => {
  before(() => {
    cy.galaxykit('collection upload');
  });

  it("can't download collections", () => {
    cy.visit(uiPrefix);
    cy.contains('.pf-c-title', 'Collections');

    // go to a detail screen
    cy.get('.pf-c-card__header .name a').first().click();

    cy.contains(
      '.pf-c-alert.pf-m-warning',
      'You have to be logged in to be able to download the tarball',
    );
    cy.contains('.pf-c-button', 'Download tarball').should('not.exist');
  });
});
