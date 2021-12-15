describe('Imports filter test', () => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  before(() => {
    cy.login(adminUsername, adminPassword);

    // insert test data

    cy.galaxykit('-i collection upload filter_test_namespace my_collection1');
    cy.galaxykit('-i collection upload filter_test_namespace my_collection2');
    cy.galaxykit('-i collection upload filter_test_namespace different_name');
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/my-imports?namespace=filter_test_namespace');
  });

  it('partial filter for name is working.', () => {
    cy.get('input[aria-label="keywords"').type('my_collection{enter}');
    cy.get('.import-list-data').contains('my_collection1');
    cy.get('.import-list-data').contains('my_collection2');
    cy.get('.import-list-data').contains('different_name').should('not.exist');
  });

  it('exact filter for name is working.', () => {
    cy.get('input[aria-label="keywords"').type('my_collection1{enter}');
    cy.get('.import-list-data').contains('my_collection1');
    cy.get('.import-list-data').contains('my_collection2').should('not.exist');
    cy.get('.import-list-data').contains('different_name').should('not.exist');
  });

  it('Exact search for completed is working.', () => {
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();
    cy.contains('a', 'Completed').click();

    cy.get('.import-list-data').contains('my_collection1');
    cy.get('.import-list-data').contains('my_collection2');
    cy.get('.import-list-data').contains('different_name');

    cy.wait(6000);
  });

  it('Exact search for waiting is working.', () => {
    cy.get('.import-list button:first').click();
    cy.contains('a', 'Status').click();

    cy.get('.import-list button').eq(1).click();
    cy.contains('a', 'Waiting').click();
    cy.contains('No results found');
  });
});
