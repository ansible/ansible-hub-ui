const uiPrefix = Cypress.env('uiPrefix');

describe('Approval Dashboard process', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'appp_n_test');
    cy.galaxykit('-i collection upload', 'appp_n_test', 'appp_c_test1');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the whole approval process.', () => {
    cy.visit(`${uiPrefix}collections`);
    cy.contains('No collections yet');

    // should approve
    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('[data-cy^="CertificationDashboard-row"]', 'Needs review');
    cy.contains(
      '[data-cy^="CertificationDashboard-row"] button',
      'Sign and approve',
    ).click();
    cy.contains('.body', 'No results found', { timeout: 8000 });
    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('button', 'Clear all filters').click();
    cy.contains(
      '[data-cy^="CertificationDashboard-row"]',
      'Signed and approved',
    );

    // should see item in collections
    cy.visit(`${uiPrefix}collections?page_size=100`);
    cy.contains('.collection-container', 'appp_c_test1');

    // should reject
    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('button', 'Clear all filters').click();
    cy.get('[data-cy="kebab-toggle"]:first button[aria-label="Actions"]').click(
      { force: true },
    );
    cy.contains('Reject').click({ force: true });
    cy.contains('[data-cy^="CertificationDashboard-row"]', 'Rejected');

    // should not see items in collections
    cy.visit(`${uiPrefix}collections`);
    cy.contains('No collections yet');
  });
});
