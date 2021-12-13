describe('Collection Upload Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  it('collection is uploaded', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/repo/published/*').as(
      'namespaces',
    );

    cy.get('a[href="/ui/repo/published/ansible"]').click();
    cy.wait('@namespaces');
    cy.contains('Upload collection').click();
    cy.fixture('collections/ansible-network-1.2.0.tar.gz', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'ansible-network-1.2.0.tar.gz',
          mimeType: 'application/gzip',
        });
      });
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');
    cy.contains('My imports');
    cy.get('.pf-c-label__content').contains('Running').should('exist');
    cy.wait('@upload', { timeout: 10000 });
    cy.get('.pf-c-label__content').contains('Completed').should('exist');
  });
});
