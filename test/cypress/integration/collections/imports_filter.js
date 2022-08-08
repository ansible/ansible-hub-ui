describe('Imports filter test', () => {
  const testCollection = `test_collection_${Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')}`;

  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();

    // insert test data
    cy.galaxykit('namespace create', 'test_namespace');
    cy.galaxykit('collection upload', 'test_namespace', testCollection);

    cy.galaxykit('namespace create filter_test_namespace');
    cy.galaxykit('collection upload filter_test_namespace my_collection1');
    cy.galaxykit('collection upload filter_test_namespace my_collection2');
    cy.galaxykit('collection upload filter_test_namespace different_name');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/my-imports?namespace=filter_test_namespace');
  });

  it('should display success info after importing collection', () => {
    cy.visit('/ui/my-imports?namespace=test_namespace');

    cy.get(`[data-cy="ImportList-row-${testCollection}"]`).click();
    cy.get('[data-cy="MyImports"] [data-cy="ImportConsole"]').contains(
      `test_namespace.${testCollection}`,
    );
    cy.get(
      '[data-cy="MyImports"] [data-cy="ImportConsole"] .title-bar',
    ).contains('Completed', { timeout: 10000 });
    cy.get(
      '[data-cy="MyImports"] [data-cy="ImportConsole"] .message-list',
    ).contains('Done');
  });

  it('should fail on importing existing collection', () => {
    cy.galaxykit('-i collection upload', 'test_namespace', testCollection);
    cy.visit('/ui/my-imports?namespace=test_namespace');

    cy.get(`[data-cy="ImportList-row-${testCollection}"]`).first().click();
    cy.get('[data-cy="MyImports"] [data-cy="ImportConsole"]').contains(
      `test_namespace.${testCollection}`,
    );
    cy.get(
      '[data-cy="MyImports"] [data-cy="ImportConsole"] .title-bar',
    ).contains('Failed', { timeout: 10000 });
    cy.get('[data-cy="MyImports"] [data-cy="ImportConsole"]').contains(
      'Error message',
    );
    cy.get(
      '[data-cy="MyImports"] [data-cy="ImportConsole"] .message-list',
    ).contains('Failed');
  });

  it('should be able to switch between namespaces', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/imports/collections/?namespace=test_namespace&*',
    ).as('collectionsInNamespace');
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/imports/collections/*',
    ).as('collectionDetail');
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/collection-versions/?namespace=test_namespace&name=*',
    ).as('collectionVersions');

    cy.get('[aria-label="Select namespace"]').select('test_namespace');

    cy.wait('@collectionsInNamespace');
    cy.wait('@collectionDetail');
    cy.wait('@collectionVersions');

    cy.get(`[data-cy="ImportList-row-${testCollection}"]`).should('be.visible');

    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/imports/collections/?namespace=filter_test_namespace&*',
    ).as('collectionsInNamespace2');
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/imports/collections/*',
    ).as('collectionDetail2');
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/collection-versions/?namespace=filter_test_namespace&name=*',
    ).as('collectionVersions2');

    cy.get('[aria-label="Select namespace"]').select('filter_test_namespace');

    cy.wait('@collectionsInNamespace2');
    cy.wait('@collectionDetail2');
    cy.wait('@collectionVersions2');

    cy.get('[data-cy="ImportList-row-my_collection1"]').should('be.visible');
  });

  it('partial filter for name is working.', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?*',
    ).as('wait');

    cy.get('input[aria-label="keywords"').type('my_collection{enter}');
    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
    cy.get('[data-cy="import-list-data"]').contains('my_collection2');
  });

  it('exact filter for name is working.', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?*',
    ).as('wait');

    cy.get('input[aria-label="keywords"').type('my_collection1{enter}');
    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]')
      .contains('my_collection2')
      .should('not.exist');
    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
  });

  it('Exact search for completed is working.', () => {
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('wait');
    cy.contains('a', 'Completed').click();

    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
    cy.get('[data-cy="import-list-data"]').contains('my_collection2');
    cy.get('[data-cy="import-list-data"]').contains('different_name');
  });

  it('Exact search for waiting is working.', () => {
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();
    cy.contains('a', 'Waiting').click();
    cy.contains('No results found');
  });

  it('Exact search for name and completed is working.', () => {
    cy.get('input[aria-label="keywords"').type('my_collection1{enter}');
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('wait');
    cy.contains('a', 'Completed').click();

    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
  });

  it('Partial search for name and completed is working.', () => {
    cy.get('input[aria-label="keywords"').type('my_collection{enter}');
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('wait');
    cy.contains('a', 'Completed').click();
    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]').contains('my_collection2');
    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
  });
});
