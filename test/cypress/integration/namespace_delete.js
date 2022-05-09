describe('Delete a namespace', () => {
  beforeEach(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
  });

  it('deletes a namespace', () => {
    cy.galaxykit('-i namespace create', 'testns1');
    cy.menuGo('Collections > Namespaces');
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/namespaces/?sort=name*',
    ).as('reload');
    cy.get('a[href*="ui/repo/published/testns1"]').click();
    cy.get('[data-cy="ns-kebab-toggle"]').click();
    cy.contains('Delete namespace').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.wait('@reload');
    cy.get('h4[class=pf-c-alert__title]').should(
      'have.text',
      'Success alert:Namespace "testns1" has been successfully deleted.',
    );
  });

  it('cannot delete a non-empty namespace', () => {
    //create namespace
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/namespaces/?sort=name*',
    ).as('reload');
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.wait('@reload');
    cy.get('a[href*="ui/repo/published/ansible"]').click();

    //upload a collection

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
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('upload');
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');

    // attempt deletion

    cy.menuGo('Collections > Namespaces');
    cy.get('a[href*="ui/repo/published/ansible"]').click();
    cy.get('[data-cy=ns-kebab-toggle]').click();
    cy.contains('Delete namespace').click({ force: true });
    cy.contains('Delete namespace?').should('not.exist');
  });
});
