import { range } from 'lodash';

const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');
const insightsLogin = Cypress.env('insightsLogin');

describe('Collections list Tests', () => {
  function deprecate(list) {
    const container = list ? '.hub-list' : '.hub-cards';

    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get(container).contains('my_collection2').should('not.exist');
    cy.get(container).contains('my_collection0');

    cy.get('.collection-container [aria-label="Actions"]').click();
    cy.contains('Deprecate').click();
    cy.contains('No results found', { timeout: 10000 });
  }

  function undeprecate() {
    cy.visit(`${uiPrefix}repo/published/my_namespace/my_collection0`);
    cy.contains('This collection has been deprecated.');
    cy.get('[data-cy="kebab-toggle"] [aria-label="Actions"]').click();
    cy.contains('Undeprecate').click();
    cy.contains('This collection has been deprecated.', {
      timeout: 10000,
    }).should('not.exist');
  }

  function undeprecateIfDeprecated() {
    // undeprecate collection if deprecated from previous repeated run (otherwise, tests fails)
    // that is because when you deprecate, delete collection and upload it again, the collection
    // stays deprecated
    let request_url = `${apiPrefix}_ui/v1/repo/published/?limit=1&keywords=my_collection0&offset=0"`;

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
    range(11).forEach((i) => {
      cy.createApprovedCollection('my_namespace', 'my_collection' + i);
    });
  });

  after(() => {
    cy.galaxykit('task wait all');
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}collections`);
    cy.contains('Collections');
  });

  if (!insightsLogin) {
    it('checks if its deprecated and if yes, undeprecate it', () => {
      undeprecateIfDeprecated();
    });
  }

  it('can deprecate', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    deprecate(true);
  });

  it('can undeprecate', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    undeprecate();
  });

  it('can deprecate in Cards', () => {
    cy.get('[data-cy="view_type_card"] svg').click();
    deprecate(false);
  });

  it('can undeprecate in Cards', () => {
    cy.get('[data-cy="view_type_card"] svg').click();
    undeprecate(false);
  });

  it('paging is working', () => {
    // this page cant sort items, so we can only count them, there should be 11 items that we inserted
    cy.get('.collection-container').get('article').should('have.length', 10);

    cy.get('.hub-cards').get('[aria-label="Go to next page"]:first').click();
    cy.get('.collection-container').get('article').should('have.length', 1);
  });

  it('filter is working', () => {
    cy.get('.hub-cards')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get('.hub-cards').contains('my_collection0');
    cy.get('.hub-cards').contains('my_collection1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.hub-cards')
      .get('button[aria-label="Items per page"]:first')
      .click();
    cy.get('.hub-cards').get('[data-action="per-page-20"]').click();

    cy.get('.collection-container').get('article').should('have.length', 11);
  });

  it('Cards/List switch is working', () => {
    cy.get('[data-cy="view_type_list"] svg').click();

    cy.get('[data-cy="CollectionListItem"]').should('have.length', 10);
  });

  it('Can delete collection in collection list', () => {
    cy.get('[data-cy="view_type_list"] svg').click();
    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection0{enter}');
    cy.get('.hub-list').contains('my_collection2').should('not.exist');
    cy.get('.hub-list').contains('my_collection0');

    cy.get('.collection-container [aria-label="Actions"]').click();
    cy.contains('Delete entire collection').click();
    cy.get('[data-cy=modal_checkbox] input').click();
    cy.get('[data-cy=delete-button] button').click();
    cy.contains('Collection "my_collection0" has been successfully deleted.', {
      timeout: 15000,
    });
    cy.contains('No results found');
    cy.galaxykit('-i collection upload my_namespace my_collection0');
  });

  it('Can delete collection in namespace collection list', () => {
    cy.visit(`${uiPrefix}namespaces/my_namespace`);
    cy.get('.toolbar')
      .get('[aria-label="keywords"]:first')
      .type('my_collection1{enter}');

    // because of randomized order of items in list and weird filter behavior
    // we have to check that all of them dissapeared, not only one particular
    range(11).forEach((i) => {
      if (i != 1) {
        cy.get('.body')
          .contains('my_collection' + i)
          .should('not.exist');
      }
    });
    cy.get('.body').contains('my_collection1');

    cy.get('.body [aria-label="Actions"]').click();
    cy.contains('Delete entire collection').click();
    cy.get('[data-cy=modal_checkbox] input').click();
    cy.get('[data-cy=delete-button] button').click();

    cy.contains('Collection "my_collection1" has been successfully deleted.', {
      timeout: 15000,
    });
    cy.contains('No results found');
    cy.galaxykit('-i collection upload my_namespace my_collection1');
  });
});
