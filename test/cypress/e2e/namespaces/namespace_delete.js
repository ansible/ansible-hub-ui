const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Delete a namespace', () => {
  beforeEach(() => {
    cy.login();
    cy.deleteNamespacesAndCollections();
  });

  it('deletes a namespace', () => {
    cy.galaxykit('-i namespace create', 'testns1');
    cy.menuGo('Collections > Namespaces');
    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/?sort=name*`).as(
      'reload',
    );
    cy.get(`a[href*="${uiPrefix}repo/published/testns1"]`).click();
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
    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/?sort=name*`).as(
      'reload',
    );
    cy.galaxykit('-i namespace create', 'ansible');
    cy.menuGo('Collections > Namespaces');
    cy.wait('@reload');

    cy.get(`a[href*="${uiPrefix}repo/published/ansible"]`).click();

    //upload a collection

    cy.galaxykit('-i collection upload ansible network');

    // wait for imports to finish successfully

    cy.wait(10000);

    // attempt deletion
    cy.intercept(
      'GET',
      `${apiPrefix}_ui/v1/namespaces/?sort=name&offset=0&limit=20`,
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
