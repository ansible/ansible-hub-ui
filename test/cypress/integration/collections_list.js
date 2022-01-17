import { range } from 'lodash';

describe('Collections list Tests', () => {
  let items = [];

  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('namespace create my_namespace');
    // insert test data
    range(21).forEach((i) => {
      let item = { name: 'my_collection' + i };
      items.push(item);
      cy.galaxykit('-i collection upload my_namespace my_collection' + i);
    });

    // load items. Because not all test support cleaning yet,
    // some other collections may be present from previous test, so we must load them, we can not expect
    // that only our test data are in database.
    cy.intercept(
      'GET',
      Cypress.env('prefix') +
        '_ui/v1/repo/published/?deprecated=false&offset=0&limit=100',
    ).as('data');
    cy.visit('/ui/repo/published?page_size=100&view_type=null&page=1');

    cy.wait('@data').then((res) => {
      items = res.response.body.data;
    });
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
    // some remaining data can be there from previous tests
    const remaining = items.length > 30 ? 10 : items.length - 20;
    cy.get('.collection-container')
      .get('article')
      .should('have.length', remaining);
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

    cy.get('li[aria-labelledby="simple-item1"').should('have.length', 10);
  });
});
