const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');
const insightsLogin = Cypress.env('insightsLogin');

describe('Collection Upload Tests', () => {
  const userName = 'testUser';
  const userPassword = 'I am a complicated passw0rd';

  before(() => {
    cy.deleteNamespacesAndCollections();

    if (!insightsLogin) {
      cy.login();
      cy.deleteTestGroups();
      cy.deleteTestUsers();
      cy.createUser(userName, userPassword);
    }
    cy.createApprovedCollection('testspace', 'testcollection');
  });

  if (!insightsLogin) {
    it('should not upload new collection version in collection list when user does not have permissions', () => {
      cy.login(userName, userPassword);
      cy.visit(
        `${uiPrefix}collections?page_size=10&view_type=list&keywords=testcollection`,
      );
      cy.contains('testcollection');
      cy.contains('Upload new version').should('not.exist');
    });

    it('should not upload new collection version in collection list/cards when user does not have permissions', () => {
      cy.login(userName, userPassword);
      cy.visit(
        `${uiPrefix}collections?page_size=10&view_type=card&keywords=testcollection`,
      );
      cy.contains('testcollection');
      cy.get('[aria-label="Actions"]').should('not.exist');
    });

    it('should not upload new collection version in collection detail when user does not have permissions', () => {
      cy.login(userName, userPassword);
      cy.visit(`${uiPrefix}repo/published/testspace/testcollection`);
      cy.contains('testcollection');
      cy.get('button[aria-label="Actions"]').click();
      cy.contains('Upload new version').click();
      cy.contains("You don't have rights to do this operation.");
    });

    it('should see upload new collection version in collection list when user does have permissions', () => {
      cy.login();
      cy.visit(
        `${uiPrefix}collections?page_size=10&view_type=list&keywords=testcollection`,
      );
      cy.contains('testcollection');
      cy.contains('Upload new version').click();
      cy.contains('New version of testcollection');

      cy.visit(
        `${uiPrefix}collections?page_size=10&view_type=card&keywords=testcollection`,
      );
      cy.contains('testcollection');
      cy.get('button[aria-label="Actions"]').click();
      cy.contains('Upload new version').click();
      cy.contains('New version of testcollection');
    });
  }

  it('should see upload new collection version in collection detail when user does have permissions', () => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/testspace/testcollection`);
    cy.contains('testcollection');
    cy.get('[data-cy="kebab-toggle"] button[aria-label="Actions"]').click();
    cy.contains('Upload new version').click();
    cy.contains('New version of testcollection');
  });

  if (!insightsLogin) {
    it('user should not be able to upload new collection without permissions', () => {
      cy.login(userName, userPassword);
      cy.intercept(
        'GET',
        `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
      ).as('upload');
      cy.galaxykit('-i namespace create', 'ansible');
      cy.menuGo('Collections > Namespaces');

      cy.get(`a[href="${uiPrefix}namespaces/ansible/"]`).click();
      cy.contains('Upload collection').should('not.exist');
    });
  }

  it('collection should be uploaded', () => {
    cy.login();
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=*`,
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.goToNamespaces();

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
    cy.get('.pf-c-label__content').contains('Running').should('exist');
    cy.wait('@upload', { timeout: 10000 });
    cy.wait(5000);
    cy.get('.pf-c-label__content').contains('Failed').should('not.exist');
    cy.get('.pf-c-label__content').contains('Completed').should('exist');
  });

  if (!insightsLogin) {
    it('should not upload new collection version when user does not have permissions', () => {
      cy.login(userName, userPassword);
      cy.visit(`${uiPrefix}namespaces/testspace`);

      cy.get('[data-cy="CollectionList-name"]').contains('testcollection');
      cy.contains('Upload new version').should('not.exist');
    });
  }

  it('should deprecate let user deprecate and undeprecate collections', () => {
    cy.login();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.get('[aria-label=collection-kebab]').first().click();
    cy.contains('Deprecate').click();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.contains('DEPRECATED');

    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.get('[aria-label=collection-kebab]').first().click();
    cy.contains('Undeprecate').click();
    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.contains('DEPRECATED').should('not.exist');
  });
});
