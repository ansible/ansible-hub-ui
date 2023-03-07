const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

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
    cy.visit(`${uiPrefix}my-imports?namespace=filter_test_namespace`);
  });

  it('should display success info after importing collection', () => {
    cy.visit(`${uiPrefix}my-imports?namespace=test_namespace`);

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

  it('should be able to switch between namespaces', () => {
    cy.get('button[aria-label="Clear all"]').click();
    cy.contains('[data-cy="import-list-data"]', 'No namespace selected.', {
      timeout: 8000,
    });

    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/imports/collections/?namespace=test_namespace&*`,
    ).as('collectionsInNamespace');
    cy.intercept('GET', `${apiPrefix}_ui/v1/imports/collections/*`).as(
      'collectionDetail',
    );
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=test_namespace&name=*`,
    ).as('collectionVersions');

    cy.get('[placeholder="Select namespace"]').clear();
    cy.get('[placeholder="Select namespace"]').type('test_namespace');
    cy.contains('button', 'test_namespace').click();

    cy.wait('@collectionsInNamespace');
    cy.wait('@collectionDetail');
    cy.wait('@collectionVersions');

    cy.get(`[data-cy="ImportList-row-${testCollection}"]`).should('be.visible');

    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/imports/collections/?namespace=filter_test_namespace&*`,
    ).as('collectionsInNamespace2');
    cy.intercept('GET', `${apiPrefix}_ui/v1/imports/collections/*`).as(
      'collectionDetail2',
    );
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=filter_test_namespace&name=*`,
    ).as('collectionVersions2');

    cy.get('[placeholder="Select namespace"]').click();
    cy.contains('button', 'filter_test_namespace').click();

    cy.wait('@collectionsInNamespace2');
    cy.wait('@collectionDetail2');
    cy.wait('@collectionVersions2');

    cy.get('[data-cy="ImportList-row-my_collection1"]').should('be.visible');
  });
});
