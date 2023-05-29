const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Delete a namespace', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.login();
  });

  it('deletes a namespace', () => {
    cy.galaxykit('-i namespace create', 'testns1');
    cy.visit(`${uiPrefix}partners`);

    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/?sort=name*`).as(
      'reload',
    );
    cy.get(`a[href*="${uiPrefix}namespaces/testns1"]`).click();
    cy.get('[data-cy="ns-kebab-toggle"]').click();
    cy.contains('Delete namespace').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.wait('@reload');
    cy.contains('Namespace "testns1" has been successfully deleted.');
  });

  it('cannot delete a non-empty namespace', () => {
    //create namespace
    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/?sort=name*`).as(
      'reload',
    );
    cy.galaxykit('-i namespace create', 'ansible');
    cy.visit(`${uiPrefix}partners`);
    cy.wait('@reload');

    cy.get(`a[href*="${uiPrefix}namespaces/ansible"]`).click();

    //upload a collection
    cy.galaxykit('-i collection upload ansible network');
    cy.galaxykit('-i collection move ansible network');

    // wait for imports to finish successfully

    cy.wait(10000);

    // attempt deletion
    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/namespaces/?sort=name&offset=0&limit=20`,
    ).as('namespaces');
    cy.visit(`${uiPrefix}partners`);
    cy.wait('@namespaces');
    cy.contains('ansible').parent().contains('View collections').click();
    cy.get('[data-cy=ns-kebab-toggle]').click();
    cy.contains('Delete namespace')
      .invoke('attr', 'aria-disabled')
      .should('eq', 'true');
  });
});
