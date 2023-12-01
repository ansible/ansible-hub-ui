const uiPrefix = Cypress.env('uiPrefix');

describe('Approval Dashboard list tests for sorting, paging and filtering', () => {
  before(() => {
    cy.login();

    cy.galaxykit('-i namespace create approval_dashboard_namespace_test');
    cy.galaxykit(
      '-i collection upload',
      'approval_dashboard_namespace_test',
      'approval_dashboard_collection_test1',
    );
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
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('button', 'Clear all filters').click();
  });

  it('should see time informations.', () => {
    cy.contains('[data-cy="body"]', 'a few seconds ago');
  });

  it('should filter collection.', () => {
    cy.get('[data-cy="body"] [data-cy="compound_filter"] button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Collection name',
    ).click();
    cy.get('[data-cy="sort_name"]').click();
    cy.get('[data-cy="sort_name"]').click();

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
      'Collection name',
    ).click();
    cy.get('[data-cy="body"] .hub-toolbar input').type(
      'approval_dashboard_collection_test0{enter}',
    );

    cy.get('[data-cy="body"] .hub-toolbar button:first').click();
    cy.contains(
      '[data-cy="body"] [data-cy="compound_filter"] a',
      'Namespace',
    ).click();
    cy.get('[data-cy="body"] [data-cy="compound_filter"] input').type(
      'approval_dashboard_namespace_test{enter}',
    );

    cy.get('[data-cy="sort_name"]').click();
    cy.get('[data-cy="sort_name"]').click();

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
