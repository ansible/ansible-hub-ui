import { range } from 'lodash';

describe('Collections list Tests', () => {
  function deprecate() {
    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get('.list').contains('my_collection2').should('not.exist');
    cy.get('.list').contains('my_collection0');

    cy.get('[aria-label=Actions]').click();
    cy.contains('Deprecate').click();
    cy.contains('No results found', { timeout: 10000 });
  }

  function undeprecate() {
    cy.visit('/ui/repo/published/my_namespace/my_collection0');
    cy.contains('This collection has been deprecated.');
    cy.get('[aria-label=Actions]').click();
    cy.contains('Undeprecate').click();
    cy.contains('This collection has been deprecated.', {
      timeout: 10000,
    }).should('not.exist');
  }

  function undeprecateIfDeprecated() {
    // undeprecate collection if deprecated from previous repeated run (otherwise, tests fails)
    // that is because when you deprecate, delete collection and upload it again, the collection
    // stays deprecated
    let request_url =
      Cypress.env('prefix') +
      '_ui/v1/repo/published/?limit=1&name=my_collection0&offset=0"';

    cy.request(request_url).then((data) => {
      const deprecated = data.body.data[0].deprecated;
      if (deprecated) {
        undeprecate();
      }
    });
  }

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
    cy.contains('Collections');
  });

  it('checks if its deprecated and if yes, undeprecate it', () => {
    undeprecateIfDeprecated();
  });

  it('can deprecate', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    deprecate();
  });

  it('can undeprecate', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    undeprecate();
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

  it('Can delete collection in collection list', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get('.list').contains('my_collection2').should('not.exist');
    cy.get('.list').contains('my_collection0');

    cy.get('[aria-label=Actions]').click();
    cy.contains('Delete entire collection').click();
    cy.get('[data-cy=modal_checkbox] input').click();
    cy.get('[data-cy=delete_button]').click();
    cy.contains('No results found', { timeout: 15000 });
  });

  it('Can delete collection in namespace collection list', () => {
    cy.visit('/ui/repo/published/my_namespace');
    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection1{enter}');
    cy.get('.body').contains('my_collection2').should('not.exist');
    cy.get('.body').contains('my_collection1');

    cy.get('.body [aria-label=Actions]').click();
    cy.contains('Delete entire collection').click();
    cy.get('[data-cy=modal_checkbox] input').click();
    cy.get('[data-cy=delete_button]').click();
    cy.contains('No results found', { timeout: 15000 });
  });
});
