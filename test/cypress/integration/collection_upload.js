describe('Collection Upload Tests', () => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
  });

  it('collection is uploaded', () => {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/collection-versions/?namespace=*',
    ).as('upload');
    const filepath = 'collections/ansible-network-1.2.0.tar.gz';
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/repo/published/*').as(
      'namespaces',
    );

    cy.get('a[href="/ui/repo/published/ansible"]').click();
    cy.wait('@namespaces');
    cy.contains('Upload collection').click();
    cy.get('input[type="file"]').attachFile(filepath);
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait('@upload');
    cy.contains('My imports');
    cy.get('.pf-c-label__content').contains('Completed');
  });
});
