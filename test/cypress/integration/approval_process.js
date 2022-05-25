describe('Approval Dashboard process', () => {
  before(() => {
    cy.settings({ GALAXY_REQUIRE_CONTENT_APPROVAL: true });
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'appp_n_test');
    cy.galaxykit('-i collection upload', 'appp_n_test', 'appp_c_test1');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
    cy.settings();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should not see items in collections.', () => {
    cy.visit('/ui/repo/published');
    cy.contains('No collections yet');
  });

  it('should approve', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('[data-cy="CertificationDashboard-row"]', 'Needs review');
    cy.contains(
      '[data-cy="CertificationDashboard-row"] button',
      'Approve',
    ).click();
    cy.contains('.body', 'No results found', { timeout: 8000 });
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    cy.contains('[data-cy="CertificationDashboard-row"]', 'Approved');
  });

  it('should see item in collections.', () => {
    cy.visit('/ui/repo/published?page_size=100');
    cy.contains('.collection-container', 'appp_c_test1');
  });

  it('should reject', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    cy.get('[data-cy="kebab-toggle"]:first button[aria-label="Actions"]').click(
      { force: true },
    );
    cy.contains('Reject').click({ force: true });
    cy.contains('[data-cy="CertificationDashboard-row"]', 'Rejected');
  });

  it('should not see items in collections.', () => {
    cy.visit('/ui/repo/published');
    cy.contains('No collections yet');
  });
});
