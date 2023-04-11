const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('tests the approval list screen ', () => {
  beforeEach(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'ansible');
    cy.galaxykit('-i collection upload ansible network');
    cy.visit(`${uiPrefix}approval-dashboard`);
  });

  it('has a default Needs Review filter', () => {
    cy.get('.pf-c-chip-group__list').contains('Needs Review');
  });

  it('rejects certification status and approves it again', () => {
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?order_by=-pulp_created&offset=0&limit=10`,
    ).as('reload');
    cy.get('.pf-c-chip > button[aria-label="close"]').click();
    cy.wait('@reload');

    // reject
    cy.get('button[aria-label="Actions"]:first').click();
    cy.contains('Reject').click();
    cy.contains(
      '[data-cy^="CertificationDashboard-row"]:first-child',
      'Rejected',
    );

    // approve
    cy.get('button[aria-label="Actions"]:first').click();
    cy.contains('Sign and approve').click();
    cy.contains(
      '[data-cy^="CertificationDashboard-row"]:first-child',
      'Signed and approved',
    );
  });

  it('view the imports logs', () => {
    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/ansible/search/collection-versions/?order_by=-pulp_created&offset=0&limit=10`,
    ).as('reload');
    cy.get('.pf-c-chip > button[aria-label="close"]').click();
    cy.wait('@reload');

    //imports page

    cy.get('button[aria-label="Actions"]:first').click();
    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/imports/collections/?namespace=ansible&name=network&version=1.0.0&sort=-created&offset=0&limit=10`,
    ).as('imports');
    cy.contains('View Import Logs').click();
    cy.wait('@imports');
    cy.contains('My imports');
    cy.get('[placeholder="Select namespace"]').should('have.value', 'ansible');

    cy.get('.pf-c-chip-group__list').contains('network');
    cy.get('.pf-c-chip-group').contains('1.0.0');
  });
});
