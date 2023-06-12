const uiPrefix = Cypress.env('uiPrefix');
const apiPrefix = Cypress.env('apiPrefix');

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

  it('collection should be uploaded into different repo', () => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i repository create staging2 --pipeline staging');
    cy.galaxykit('-i distribution create staging2');
    cy.login();
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');

    cy.get(`a[href="${uiPrefix}namespaces/ansible/"]`).click();
    cy.contains('Upload collection').click();
    cy.fixture('collections/ansible-posix-1.4.0.tar.gz', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'ansible-posix-1.4.0.tar.gz',
          mimeType: 'application/gzip',
        });
      });
    cy.get('[data-cy="ApproveModal-RadioRow-row-staging2"] input').click();
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');
    cy.wait(10000);
    cy.contains('My imports');
    cy.get('.pf-c-label__content').contains('Running').should('exist');
    cy.wait('@upload', { timeout: 10000 });
    cy.wait(5000);
    cy.get('.pf-c-label__content').contains('Failed').should('not.exist');
    cy.get('.pf-c-label__content').contains('Completed').should('exist');
    cy.visit(`${uiPrefix}repo/staging2/ansible/posix/`);
    cy.contains('ansible');
    cy.contains('posix');
    cy.contains('1.4.0');
  });
});
