const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Collection Upload Tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('-i collection upload testspace testcollection');
    cy.galaxykit('-i collection move testspace testcollection');
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  it('should see upload new collection version in collection detail when user does have permissions', () => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/testspace/testcollection`);
    cy.contains('testcollection');
    cy.openHeaderKebab();
    cy.contains('Upload new version').click();
    cy.contains('New version of testcollection');
  });

  it('collection should be uploaded', () => {
    cy.login();
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.visit(`${uiPrefix}partners`);

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
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');
    cy.wait(10000);
    cy.contains('My imports');
    cy.get('.pf-v5-c-label__content').contains('Running').should('exist');
    cy.wait('@upload', { timeout: 10000 });
    cy.wait(5000);
    cy.get('.pf-v5-c-label__content').contains('Failed').should('not.exist');
    cy.get('.pf-v5-c-label__content').contains('Completed').should('exist');
  });

  it('should deprecate let user deprecate and undeprecate collections', () => {
    cy.login();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.get('[data-cy=collection-kebab]').first().click();
    cy.contains('Deprecate').click();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.contains('DEPRECATED');

    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.get('[data-cy=collection-kebab]').first().click();
    cy.contains('Undeprecate').click();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.contains('DEPRECATED').should('not.exist');
  });
});
