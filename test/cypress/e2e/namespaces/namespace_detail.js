describe('Namespace detail screen', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('-i namespace create', 'namespace_detail_test');
    cy.galaxykit('-i collection upload namespace_detail_test collection1');
    cy.galaxykit('-i collection upload namespace_detail_test collection2');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/repo/published/namespace_detail_test');
  });

  it('should display the collections belonging to the namespace', () => {
    cy.get('[data-cy="CollectionListItem"]').should('have.length', 2);
    cy.get('[data-cy="CollectionListItem"]').contains('collection1');
    cy.get('[data-cy="CollectionListItem"]').contains('collection2');
  });

  it('should show deprecation label after button click and page reload', () => {
    cy.get(
      '[data-cy="CollectionListItem"]:first button[aria-label="Actions"]',
    ).click();
    cy.contains('.body ul a', 'Deprecate').click();

    // Reload the page
    cy.visit('/ui/repo/published/namespace_detail_test');

    cy.get('[data-cy="CollectionListItem"]:first').contains('DEPRECATED');
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.get('.pf-c-tabs__link').eq(1).click();
    cy.get('[aria-label="Copyable input"]')
      .invoke('val')
      .should('contain', '/inbound-namespace_detail_test/');
  });

  it('should show an error when tring to upload a new collecting wiht invalid name', () => {
    cy.get('[data-cy="kebab-toggle"] > .pf-c-button').click();
    cy.fixture('collections/invalid-collection-name-1.0.0-bad.tar.gz', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'invalid-collection-name-1.0.0-bad.tar.gz',
          mimeType: 'application/gzip',
        });
      });
    cy.get('.file-error-messages').should(
      'contain',
      'does not match this namespace',
    );

    cy.fixture(
      'collections/namespace_detail_test-invalid-1.0.0(1).tar.gz',
      'binary',
    )
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'namespace_detail_test-invalid-1.0.0(1).tar.gz',
          mimeType: 'application/gzip',
        });
      });
    cy.get('[data-cy="confirm-upload"]').click();
    cy.get('.file-error-messages').should('contain', 'Invalid filename');

    // The test for success are impmeneted in the collection_upload file
  });

  it('should filter by repositories', () => {
    const namespace = 'coolestnamespace';
    cy.galaxykit('-i namespace create', namespace);
    cy.visit(`/ui/repo/published/${namespace}`);

    cy.get('.nav-select').contains('Published').click();
    cy.contains('Red Hat Certified').click();

    cy.get('.nav-select').contains('Red Hat Certified');
    cy.url().should('include', `/repo/rh-certified/${namespace}`);

    cy.visit(`/ui/repo/community/${namespace}`);
    cy.get('.nav-select').contains('Community');
  });

  it('repo selector should be disabled in collection detail ', () => {
    const namespace = 'coolestnamespace';
    const collection = 'coolestcollection';
    cy.galaxykit('-i namespace create', namespace);
    cy.galaxykit('collection upload', namespace, collection);

    cy.visit(`/ui/repo/published/${namespace}/${collection}`);
    cy.get('.nav-select').contains('Published').should('be.disabled');
  });
});
