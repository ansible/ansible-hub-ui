const uiPrefix = Cypress.env('uiPrefix');

describe('Approval Dashboard process', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the whole approval process.', () => {
    cy.galaxykit('-i namespace create', 'appp_n_test');
    cy.galaxykit('-i collection upload', 'appp_n_test', 'appp_c_test1');
    cy.galaxykit('task wait all');
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

  it('should copy collection version to validated repository', () => {
    cy.deleteNamespacesAndCollections();
    const rand = Math.floor(Math.random() * 9999999);
    const namespace = `foo_${rand}`;
    const collection = `bar_${rand}`;
    cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);

    cy.get('[data-cy="kebab-toggle"]').click();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();

    cy.contains('Select repositories');
    cy.get(
      '[data-cy="ApproveModal-CheckboxRow-row-published"] .pf-c-table__check input',
    ).should('be.disabled');

    cy.get("[aria-label='name__icontains']").type('validate{enter}');
    cy.get(
      "[data-cy='ApproveModal-CheckboxRow-row-validated'] .pf-c-table__check input",
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.0 from "staging" to repository "validated".`,
    );
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');
  });
});
