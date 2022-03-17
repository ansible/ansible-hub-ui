import { range } from 'lodash';

describe('Collections list Tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('namespace create my_namespace');
    // insert test data
    range(21).forEach((i) => {
      cy.galaxykit('-i collection upload my_namespace my_collection' + i);
    });
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/repo/published');
  });

  it('paging is working', () => {
    // this page cant sort items, so we can only count them, there should be at least 21 items that we inserted
    cy.get('.collection-container').get('article').should('have.length', 10);

    cy.get('.cards').get('[aria-label="Go to next page"]:first').click();
    cy.get('.collection-container').get('article').should('have.length', 10);

    cy.get('.cards').get('[aria-label="Go to next page"]:first').click();
    cy.get('.collection-container').get('article').should('have.length', 1);
  });

  it('filter is working', () => {
    cy.get('.cards')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get('.cards').contains('my_collection0');
    cy.get('.cards').contains('my_collection1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.cards').get('button[aria-label="Items per page"]:first').click();
    cy.get('.cards').get('[data-action="per-page-20"]').click();

    cy.get('.collection-container').get('article').should('have.length', 20);
  });

  it('Cards/List switch is working', () => {
    cy.get('[data-cy="view_type_list"] svg').click();

    cy.get('[data-cy="CollectionListItem"]').should('have.length', 10);
  });

  it('should switch repos when clicking on the dropdown', () => {
    cy.get('button[aria-label="Options menu"]:first').click();
    cy.get('button[name="rh-certified"]:first').click();
    cy.get('.cards .card').should('have.length', 0);

    // Switch back (to have data again)
    cy.get('button[aria-label="Options menu"]:first').click();
    cy.get('button[name="published"]:first').click();
    cy.get('.cards .card').should('have.length', 10);

    cy.get('button[aria-label="Options menu"]:first').click();
    cy.get('button[name="community"]:first').click();
    cy.get('.cards .card').should('have.length', 0);
  });
});
