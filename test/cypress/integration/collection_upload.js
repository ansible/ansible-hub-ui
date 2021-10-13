describe('Collection Upload Tests', () => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
  });

  it('collection is uploaded', () => {
    const filepath = 'collections/arista-cvp-3.1.0.tar.gz';
    cy.galaxykit('-i namespace create', 'arista');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', Cypress.env('prefix') + 'v1/namespaces/arista').as(
      'namespaces',
    );

    cy.get('a[href="/ui/repo/published/arista"]').click();
    cy.wait(500);
    cy.contains('Upload collection').click();
    cy.get('input[type="file"]').attachFile(filepath);
    cy.get('[data-cy="confirm-upload"]').click();
    cy.wait(500);
    cy.contains('My imports');
  });
});
