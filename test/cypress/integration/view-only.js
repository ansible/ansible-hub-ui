describe('view-only mode', () => {
  before(() => {
    cy.settings({
      GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: true,
    });
  });

  it('can load Collections', () => {
    cy.visit('/');
    cy.contains('.pf-c-title', 'Collections');
  });

  after(() => {
    cy.settings(); // reset
  });
});
