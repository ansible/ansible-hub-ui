import { range, sortBy } from 'lodash';

describe('Approval Dashboard list tests for sorting, paging and filtering', () => {
  let items = [];

  function deleteData() {
    var intercept_url =
      Cypress.env('prefix') +
      '_ui/v1/collection-versions/?sort=-pulp_created&offset=0&limit=100';

    cy.visit('/ui/approval-dashboard?page_size=100');
    cy.intercept('GET', intercept_url).as('data');
    cy.contains('button', 'Clear all filters').click();

    cy.wait('@data').then((res) => {
      var data = res.response.body.data;
      data.forEach((record) => {
        cy.galaxykit(
          'collection delete ' + record.namespace + ' ' + record.name,
        );
      });
    });
  }

  function createData() {
    cy.galaxykit('-i namespace create approval_dashboard_namespace_test');
    range(21).forEach((i) => {
      cy.galaxykit(
        '-i collection upload',
        'approval_dashboard_namespace_test',
        'approval_dashboard_collection_test' + i,
      );
    });

    cy.galaxykit(
      '-i collection upload',
      'approval_dashboard_namespace_test_additional_data',
      'approval_dashboard_collection_test_additional1',
    );
    cy.galaxykit(
      '-i collection upload',
      'approval_dashboard_namespace_test_additional_data',
      'approval_dashboard_collection_test_additional2',
    );
  }

  function loadData() {
    // we cant delete all data using galaxykit right now, because when collection is rejected
    // it cant be deleted. So we must load the data, that are right now in the table
    var intercept_url =
      Cypress.env('prefix') +
      '_ui/v1/collection-versions/?sort=-pulp_created&offset=0&limit=100';

    cy.visit('/ui/approval-dashboard?page_size=100');
    cy.intercept('GET', intercept_url).as('data');
    cy.contains('button', 'Clear all filters').click();

    cy.wait('@data').then((res) => {
      var data = res.response.body.data;
      data.forEach((record) => {
        items.push({ name: record.name });
      });

      items = sortBy(items, 'name');
      cy.log(items.length);
      cy.log(JSON.stringify(items));
    });
  }

  before(() => {
    cy.login();
    deleteData();
    createData();
    loadData();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
  });

  it('table contains all columns', () => {
    ['Namespace', 'Collection', 'Version', 'Date created', 'Status'].forEach(
      (item) => {
        cy.get('tr[aria-labelledby="headers"] th').contains(item);
      },
    );
  });

  it('items are sorted alphabetically and paging is working', () => {
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('.body').contains(items[0].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[10].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[20].name);
  });

  it('sorting is working for collection', () => {
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('.body').contains('approval');

    cy.get('.body tbody tr:first').contains(items[items.length - 1].name);
    cy.get('.body tbody').contains(items[items.length - 2].name);
    cy.get('.body tbody').contains(items[items.length - 3].name);
  });

  it('table contains some time informations', () => {
    cy.contains('a few seconds ago');
  });

  it('collection filter is working', () => {
    cy.get('.body .toolbar button:first').click();
    cy.contains('.body .toolbar a', 'Collection Name').click();
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('.body .toolbar input').type(
      'approval_dashboard_collection_test0{enter}',
    );
    cy.get('.body').contains('approval_dashboard_collection_test0');
    cy.get('.body')
      .contains('approval_dashboard_collection_test1')
      .should('not.exist');
  });

  it('collection filter and namespace filter is working', () => {
    cy.get('.body .toolbar button:first').click();
    cy.contains('.body .toolbar a', 'Collection Name').click();
    cy.get('.body .toolbar input').type(
      'approval_dashboard_collection_test0{enter}',
    );

    cy.get('.body .toolbar button:first').click();
    cy.contains('.body .toolbar a', 'Namespace').click();
    cy.get('.body .toolbar input').type(
      'approval_dashboard_namespace_test{enter}',
    );

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('.body').contains('approval_dashboard_collection_test0');
    cy.get('.body')
      .contains('approval_dashboard_collection_test1')
      .should('not.exist');
    cy.get('.body')
      .contains('approval_dashboard_namespace_test_additional_data')
      .should('not.exist');
  });

  it('filter non existing namespace is working and not showing any data', () => {
    cy.get('.body .toolbar button:first').click();
    cy.contains('.body .toolbar a', 'Namespace').click();
    cy.get('.body .toolbar input').type('namespace1354564sdfhdfhhfdf{enter}');

    cy.get('.body').contains('No results found');
  });

  it('set page size is working', () => {
    cy.get('.body').get('button[aria-label="Items per page"]:first').click();
    cy.get('.body').contains('20 per page').click();

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    range(20).forEach((i) => {
      cy.get('.body').contains(items[i].name);
    });
  });
});
