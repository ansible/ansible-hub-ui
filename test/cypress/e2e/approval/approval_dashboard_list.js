import { range, sortBy } from 'lodash';

const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Approval Dashboard list tests for sorting, paging and filtering', () => {
  let items = [];

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
    let intercept_url = `${apiPrefix}_ui/v1/collection-versions/?sort=-pulp_created&offset=0&limit=100`;

    cy.visit(`${uiPrefix}approval-dashboard?page_size=100`);
    cy.intercept('GET', intercept_url).as('data');
    cy.contains('button', 'Clear all filters').click();

    cy.wait('@data').then((res) => {
      let data = res.response.body.data;
      data.forEach((record) => {
        items.push({ name: record.name });
      });
      items = sortBy(items, 'name');
    });
  }

  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
    createData();
    loadData();
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('button', 'Clear all filters').click();
  });

  it('should contains all columns.', () => {
    ['Namespace', 'Collection', 'Version', 'Date created', 'Status'].forEach(
      (item) => {
        cy.get('[data-cy="SortTable-headers"]').contains(item);
      },
    );
  });

  it('should sort alphabetically and paging is working.', () => {
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('[data-cy="body"]').contains(items[0].name);

    cy.get('[data-cy="body"]')
      .get('[aria-label="Go to next page"]:first')
      .click();
    cy.get('[data-cy="body"]').contains(items[10].name);

    cy.get('[data-cy="body"]')
      .get('[aria-label="Go to next page"]:first')
      .click();
    cy.get('[data-cy="body"]').contains(items[20].name);
  });

  it('should sort collection.', () => {
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="body"]').contains('approval');

    cy.get('[data-cy="CertificationDashboard-row"]:first').contains(
      items[items.length - 1].name,
    );
    cy.get('[data-cy="CertificationDashboard-row"]').contains(
      items[items.length - 2].name,
    );
    cy.get('[data-cy="CertificationDashboard-row"]').contains(
      items[items.length - 3].name,
    );
  });

  it('should see time informations.', () => {
    cy.contains('[data-cy="body"]', 'a few seconds ago');
  });

  it('should filter collection.', () => {
    cy.get('[data-cy="body"] [data-cy="compound_filter"] button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Collection Name',
    ).click();
    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('[data-cy="body"] [data-cy="compound_filter"] input').type(
      'approval_dashboard_collection_test0{enter}',
    );
    cy.get('[data-cy="body"]').contains('approval_dashboard_collection_test0');
    cy.get('[data-cy="body"]')
      .contains('approval_dashboard_collection_test1')
      .should('not.exist');
  });

  it('should filter collection and namespace together.', () => {
    cy.get('[data-cy="body"] [data-cy="compound_filter"] button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Collection Name',
    ).click();
    cy.get('[data-cy="body"] .toolbar input').type(
      'approval_dashboard_collection_test0{enter}',
    );

    cy.get('[data-cy="body"] .toolbar button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Namespace',
    ).click();
    cy.get('[data-cy="body"] [data-cy="compound_filter"] input').type(
      'approval_dashboard_namespace_test{enter}',
    );

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('[data-cy="body"]').contains('approval_dashboard_collection_test0');
    cy.get('[data-cy="body"]')
      .contains('approval_dashboard_collection_test1')
      .should('not.exist');
    cy.get('[data-cy="body"]')
      .contains('approval_dashboard_namespace_test_additional_data')
      .should('not.exist');
  });

  it('should filter non existing namespace and not show any data', () => {
    cy.get('[data-cy="body"] [data-cy="compound_filter"] button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Namespace',
    ).click();
    cy.get('[data-cy="body"] [data-cy="compound_filter"] input').type(
      'namespace1354564sdfhdfhhfdf{enter}',
    );

    cy.get('[data-cy="body"]').contains('No results found');
  });

  it('should set page size', () => {
    cy.get('[data-cy="body"]')
      .get('button[aria-label="Items per page"]:first')
      .click();
    cy.get('[data-cy="body"]').contains('20 per page').click();

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    range(20).forEach((i) => {
      cy.get('[data-cy="body"]').contains(items[i].name);
    });
  });

  it('should redirect to import logs.', () => {
    cy.get(
      '[data-cy="kebab-toggle"]:first button[aria-label="Actions"]',
    ).click();
    cy.contains('View Import Logs').click();
    cy.contains('My imports');
    cy.get('.import-list');
  });
});
