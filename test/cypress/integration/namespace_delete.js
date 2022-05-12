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

    // sign collection

    cy.menuGo('Collections > Collections');
    cy.contains('network').click();
    cy.get('[data-cy="kebab-toggle"]').click();
    cy.contains('Sign entire collection').click();
    cy.intercept(
      'POST',
      Cypress.env('prefix') + '_ui/v1/collection_signing/',
    ).as('signed');
    cy.get('button').contains('Sign all').click();
    cy.wait('@signed');

    // approval dashboard, sign and approve

    // cy.menuGo('Collections > Approval');
    // cy.get('button[aria-label="Actions"]:first').click();
    // cy.intercept(
    //   'POST',
    //   Cypress.env('prefix') +
    //     'v3/collections/namespace_detail_test/collection1/versions/1.0.0/move/rejected/published/',
    // ).as('signAndApprove');
    // cy.contains('Sign and approve').click();
    // cy.wait('@signAndApprove');

    // attempt deletion
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/namespaces/?sort=name&offset=0&limit=20',
    ).as('namespaces');
    cy.menuGo('Collections > Namespaces');
    cy.wait('@namespaces');
    cy.contains('ansible').parent().contains('View collections').click();
    cy.get('[data-cy=ns-kebab-toggle]').click();
    cy.contains('Delete namespace')
      .invoke('attr', 'aria-disabled')
      .should('eq', 'true');
  });
});
