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

  it('partial filter for name is working.', () => {
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?*`,
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
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?*`,
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
    cy.get('[data-cy="compound_filter"] button:first').click();
    cy.contains('[data-cy="compound_filter"] a', 'Status').click();

    cy.get('[data-cy="compound_filter"] button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('wait');
    cy.contains('[data-cy="compound_filter"] a', 'Completed').click();

    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
    cy.get('[data-cy="import-list-data"]').contains('my_collection2');
    cy.get('[data-cy="import-list-data"]').contains('different_name');
  });

  it('Exact search for waiting is working.', () => {
    cy.get('[data-cy="compound_filter"] button:first').click();
    cy.contains('[data-cy="compound_filter"] a', 'Status').click();

    cy.get('[data-cy="compound_filter"] button').eq(1).click();
    cy.contains('[data-cy="compound_filter"] a', 'Waiting').click();
    cy.contains('No results found');
  });

  it('Exact search for name and completed is working.', () => {
    cy.get('[data-cy="compound_filter"] input[aria-label="keywords"').type(
      'my_collection1{enter}',
    );
    cy.get('[data-cy="compound_filter"] button:first').click();
    cy.contains('[data-cy="compound_filter"] a', 'Status').click();

    cy.get('[data-cy="compound_filter"] button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('wait');
    cy.contains('a', 'Completed').click();

    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
    cy.get('[data-cy="import-list-data"]').contains('my_collection1');
  });

  it('Partial search for name and completed is working.', () => {
    cy.get('[data-cy="compound_filter"] input[aria-label="keywords"').type(
      'my_collection{enter}',
    );
    cy.get('[data-cy="compound_filter"] button:first').click();
    cy.contains('[data-cy="compound_filter"] a', 'Status').click();

    cy.get('[data-cy="compound_filter"] button').eq(1).click();

    // waiting to another query, otherwise sporadic failuers
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('wait');
    cy.contains('a', 'Completed').click();
    cy.wait('@wait');

    cy.get('[data-cy="import-list-data"]').contains('my_collection2');
    cy.get('[data-cy="import-list-data"]')
      .contains('different_name')
      .should('not.exist');
  });
});
