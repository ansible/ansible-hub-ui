describe('Approval Dashboard process', () => {
  before(() => {
    cy.settings({ GALAXY_REQUIRE_CONTENT_APPROVAL: true });
    cy.settings({ GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL: false });
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i collection upload', 'appp_n_test', 'appp_c_test1');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
    cy.settings();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should reject', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    cy.get('[data-cy="kebab-toggle"]:first button[aria-label="Actions"]').click(
      { force: true },
    );
    cy.contains('Reject').click({ force: true });
    cy.get('[data-cy="CertificationDashboard-row"]').contains('Rejected');
  });

  it('should not see items in collections.', () => {
    cy.visit('/ui/repo/published');
    cy.contains('No collections yet');
  });

  it('should approve', () => {
    cy.visit('/ui/approval-dashboard');
    cy.contains('button', 'Clear all filters').click();
    cy.get('[data-cy="kebab-toggle"]:first button[aria-label="Actions"]').click(
      { force: true },
    );
    cy.contains('Approve').click({ force: true });
    cy.get('[data-cy="CertificationDashboard-row"]').contains('Approved');
  });

  it('should see item in collections.', () => {
    cy.visit('/ui/repo/published?page_size=100');
    cy.contains('appp_c_test1');
  });
});
