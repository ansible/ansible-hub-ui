import { range, sortBy } from 'lodash';

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
    let intercept_url =
      Cypress.env('prefix') +
      '_ui/v1/collection-versions/?sort=-pulp_created&offset=0&limit=100';

    cy.visit('/ui/approval-dashboard?page_size=100');
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
    cy.settings({ GALAXY_REQUIRE_CONTENT_APPROVAL: true });
    cy.login();
    //cy.deleteNamespacesAndCollections();
    //createData();
    loadData();
    cy.viewport(2550, 750);
  });

  after(() => {
    //cy.deleteNamespacesAndCollections();
    //cy.settings();
  });

  beforeEach(() => {
    cy.login();
  });

  it.skip('should not see items in collections.', () => {
    cy.visit('/ui/repo/published');
    cy.visit('No collections yet');
  });

  it('should approve items.', () => {
    /*cy.intercept(
        'GET',
        Cypress.env('prefix') +
      '_ui/v1/collection-versions/*',
      ).as('wait');*/

    cy.visit('/ui/approval-dashboard?page_size=100');
    cy.contains('Approval dashboard');
    cy.get('[data-cy="sort_collection"]').click();

    //cy.visit('@wait');

    /*cy.contains('.button', 'Approve').each((el) => {
      debugger;
      cy.log(el);
      //el.click();
    });*/
  });

  /*
  it('should see items in collections.', () => {
    cy.visit('/ui/repo/published?page_size=100');
    cy.contains(items[0]);
    cy.contains(items[1]);
    cy.contains(items[2]);
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

    cy.get('[data-cy="table_row"]:first button').click();
    cy.contains('Reject').click();
    cy.contains('[data-cy="table_row"]', items[0].name).contains('Rejected');

    cy.get('[data-cy="table_row"]:first button').click();
    cy.contains('Approve').click();
    cy.contains('[data-cy="table_row"]', items[0].name).contains('Approved');
  });

  it('should redirect to import logs.', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    
    cy.get('[data-cy="table_row"]:first button').click();
    cy.contains('View Import Logs').click();
    cy.contains('My imports');
    cy.get('.import-list');
  });
  */
});
