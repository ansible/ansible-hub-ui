const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Delete a namespace', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('deletes a namespace', () => {
    cy.galaxykit('-i namespace create', 'testns1');
    cy.menuGo('Collections > Namespaces');

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
    // create namespace
    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/?sort=name*`).as(
      'reload',
    );
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.wait('@reload');

    cy.get(`a[href*="${uiPrefix}namespaces/ansible"]`).click();

    // upload a collection & approve
    cy.galaxykit('collection upload ansible network');
    cy.galaxykit('collection approve ansible network 1.0.0');

    // attempt deletion
    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/namespaces/?sort=name&offset=0&limit=20`,
    ).as('namespaces');
    cy.menuGo('Collections > Namespaces');
    cy.wait('@namespaces');
    cy.contains('ansible')
      .parents('.card-wrapper')
      .contains('View collections')
      .click();
    cy.get('[data-cy=ns-kebab-toggle]').click();
    cy.contains('Delete namespace')
      .invoke('attr', 'aria-disabled')
      .should('eq', 'true');
  });
});
