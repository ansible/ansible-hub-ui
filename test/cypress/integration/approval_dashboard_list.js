import { range, sortBy } from 'lodash';

describe('Approval Dashboard list tests for sorting, paging and filtering', () => {
  let items = [];

  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.createApprovalData(21, items, true);
  });

  after(() => {
    //cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should contains all columns.', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    ['Namespace', 'Collection', 'Version', 'Date created', 'Status'].forEach(
      (item) => {
        cy.get('[data-cy="SortTable-headers"]').contains(item);
      },
    );
  });

  it('should sort alphabetically and paging is working.', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    debugger;

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
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

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
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

    cy.contains('[data-cy="body"]', 'a few seconds ago');
  });

  it('should filter collection.', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

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
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

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
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

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
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

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

  it('should approve or reject', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

    cy.get('[data-cy="sort_collection"]').click();
    cy.get('[data-cy="sort_collection"]').click();

    cy.get('[data-cy="table_row"]:first button[aria-label="Actions"]').click();
    cy.contains('Reject').click();
    cy.contains('[data-cy="table_row"]', items[0].name).contains('Rejected');

    cy.get('[data-cy="table_row"]:first button[aria-label="Actions"]').click();
    cy.contains('Approve').click();
    cy.contains('[data-cy="table_row"]', items[0].name).contains('Approved');
  });

  it('should redirect to import logs.', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();

    cy.get('[data-cy="table_row"]:first button[aria-label="Actions"]').click();
    cy.contains('View Import Logs').click();
    cy.contains('My imports');
    cy.get('.import-list');
  });
});
