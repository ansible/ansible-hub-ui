describe('Imports filter test', () => {
  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();

    // insert test data
    cy.galaxykit('namespace create filter_test_namespace');
    cy.galaxykit('-i collection upload filter_test_namespace my_collection1');
    cy.galaxykit('-i collection upload filter_test_namespace my_collection2');
    cy.galaxykit('-i collection upload filter_test_namespace different_name');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/my-imports?namespace=filter_test_namespace');
  });

  it('partial filter for name is working.', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
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
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
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
    cy.wait(10000);
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
