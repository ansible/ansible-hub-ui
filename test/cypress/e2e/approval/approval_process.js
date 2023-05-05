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

describe('Collection detail approval process', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'foo');
    cy.galaxykit('-i collection upload', 'foo', 'bar');
    cy.galaxykit('-i collection upload', 'foo', 'baz');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it.skip('should test approval process with exactly one published repository.', () => {
    cy.visit(`${uiPrefix}repo/staging/foo/bar`);
    cy.contains('Staging');
    cy.get('[data-cy="kebab-toggle"] [aria-label="Actions"]').click();
    cy.contains('Sign and approve').click();

    cy.contains('Approval dashboard', { timeout: 8000 });

    cy.get(`[data-cy="CertificationDashboard-row-published-foo-bar"]`).contains(
      'foo',
    );
    cy.get(`[data-cy="CertificationDashboard-row-published-foo-bar"]`).contains(
      'bar',
    );
    cy.get(`[data-cy="CertificationDashboard-row-published-foo-bar"]`).contains(
      'Signed and approved',
    );

    cy.get('.pf-c-alert__title').contains(
      'Certification status for collection "foo bar v1.0.0" has been successfully updated.',
    );
  });

  it('should test approval process with multiple published repositories.', () => {
    cy.galaxykit('-i repository create', 'published01', '--pipeline=approved');
    cy.galaxykit('-i distribution create', 'published01');

    cy.galaxykit('-i repository create', 'published02', '--pipeline=approved');
    cy.galaxykit('-i distribution create', 'published02');

    cy.galaxykit('-i task wait all');

    cy.visit(`${uiPrefix}repo/staging/foo/baz`);
    cy.contains('Staging');
    cy.get('[data-cy="kebab-toggle"] [aria-label="Actions"]').click();
    cy.contains('Sign and approve').click();

    cy.contains('Select repositories');

    cy.get('[data-cy="ApproveModal-CheckboxRow-row-published"] input').click();
    cy.get(
      '[data-cy="ApproveModal-CheckboxRow-row-published01"] input',
    ).click();
    cy.get(
      '[data-cy="ApproveModal-CheckboxRow-row-published02"] input',
    ).click();

    cy.get('.pf-c-modal-box__footer').contains('Select').click();
    cy.contains('Approval dashboard', { timeout: 8000 });

    cy.get(`[data-cy="CertificationDashboard-row-published-foo-baz"]`).contains(
      'foo',
    );
    cy.get(`[data-cy="CertificationDashboard-row-published-foo-baz"]`).contains(
      'baz',
    );
    cy.get(`[data-cy="CertificationDashboard-row-published-foo-baz"]`).contains(
      'published',
    );

    cy.get(
      `[data-cy="CertificationDashboard-row-published01-foo-baz"]`,
    ).contains('foo');
    cy.get(
      `[data-cy="CertificationDashboard-row-published01-foo-baz"]`,
    ).contains('baz');
    cy.get(
      `[data-cy="CertificationDashboard-row-published01-foo-baz"]`,
    ).contains('published01');

    cy.get(
      `[data-cy="CertificationDashboard-row-published02-foo-baz"]`,
    ).contains('foo');
    cy.get(
      `[data-cy="CertificationDashboard-row-published02-foo-baz"]`,
    ).contains('baz');
    cy.get(
      `[data-cy="CertificationDashboard-row-published02-foo-baz"]`,
    ).contains('published02');

    cy.get('.pf-c-alert__title').contains(
      'Certification status for collection "foo baz v1.0.0" has been successfully updated.',
    );
  });
});
