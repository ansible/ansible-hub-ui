describe('Collection Upload Tests', () => {
  const userName = 'testUser';
  const userPassword = 'I am a complicated passw0rd';

  before(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.galaxykit('-i collection upload testspace testcollection');
    cy.createUser(userName, userPassword);
  });

  beforeEach(() => {
    cy.login(userName, userPassword);
  });

  it('should not upload new collection version in collection list when user does not have permissions', () => {
    cy.visit(
      '/ui/repo/published?page_size=10&view_type=list&keywords=testcollection',
    );
    cy.contains('testcollection');
    cy.contains('Upload new version').click();
    cy.contains("You don't have rights to do this operation.");

    cy.visit(
      '/ui/repo/published?page_size=10&view_type=card&keywords=testcollection',
    );
    cy.contains('testcollection');
    cy.get('[aria-label=Actions]').click();
    cy.contains('Upload new version').click();
    cy.contains("You don't have rights to do this operation.");
  });

  it('should not upload new collection version in collection detail when user does not have permissions', () => {
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.contains('testcollection');
    cy.get('button[aria-label=Actions]').click();
    cy.contains('Upload new version').click();
    cy.contains("You don't have rights to do this operation.");
  });

  it('should see upload new collection version in collection list when user does have permissions', () => {
    cy.login();

    cy.visit(
      '/ui/repo/published?page_size=10&view_type=list&keywords=testcollection',
    );
    cy.contains('testcollection');
    cy.contains('Upload new version').click();
    cy.contains('New version of testcollection');

    cy.visit(
      '/ui/repo/published?page_size=10&view_type=card&keywords=testcollection',
    );
    cy.contains('testcollection');
    cy.get('button[aria-label=Actions]').click();
    cy.contains('Upload new version').click();
    cy.contains('New version of testcollection');
  });

  it('should see upload new collection version in collection detail when user does have permissions', () => {
    cy.login();
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.contains('testcollection');
    cy.get('button[aria-label=Actions]').click();
    cy.contains('Upload new version').click();
    cy.contains('New version of testcollection');
  });

  it('user should not be able to upload new collection without permissions', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/repo/published/*').as(
      'namespaces',
    );

    cy.get('a[href="/ui/repo/published/ansible"]').click();
    cy.wait('@namespaces');
    cy.contains('Upload collection').should('not.exist');
  });

  it('collection should be uploaded', () => {
    cy.login();
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('upload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/repo/published/*').as(
      'namespaces',
    );

    cy.get('a[href="/ui/repo/published/ansible"]').click();
    cy.wait('@namespaces');
    cy.contains('Upload collection').click();
    cy.fixture('collections/ansible-network-1.2.0.tar.gz', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'ansible-network-1.2.0.tar.gz',
          mimeType: 'application/gzip',
        });
      });
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');
    cy.contains('My imports');
    cy.get('.pf-c-label__content').contains('Running').should('exist');
    cy.wait('@upload', { timeout: 10000 });
    cy.get('.pf-c-label__content').contains('Completed').should('exist');
  });

  it('should not upload new collection version when user does not have permissions', () => {
    cy.visit('/ui/repo/published/testspace');

    cy.get('[data-cy="CollectionList-name"]').contains('testcollection');
    cy.contains('Upload new version').should('not.exist');
  });

  it('should deprecate let user deprecate and undeprecate collections', () => {
    cy.login();
    cy.visit('/ui/repo/published/testspace');
    cy.get('[aria-label=collection-kebab]').first().click();
    cy.contains('Deprecate').click();
    cy.visit('/ui/repo/published/testspace');
    cy.contains('DEPRECATED');

    cy.visit('/ui/repo/published/testspace');
    cy.get('[aria-label=collection-kebab]').first().click();
    cy.contains('Undeprecate').click();
    cy.visit('/ui/repo/published/testspace');
    cy.contains('DEPRECATED').should('not.exist');
  });
});
