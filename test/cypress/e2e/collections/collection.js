const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('collection tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('deletes an entire collection', () => {
    cy.galaxykit('-i collection upload test_namespace test_collection');

    cy.visit(`${uiPrefix}repo/published/test_namespace/test_collection`);

    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-collection-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains('No collections yet', { timeout: 10000 });
  });

  it('deletes a collection version', () => {
    cy.galaxykit('-i collection upload my_namespace my_collection');

    cy.visit(`${uiPrefix}collections`);

    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/my_namespace/?*`).as(
      'reload',
    );
    cy.get(
      `a[href*="${uiPrefix}repo/published/my_namespace/my_collection"]`,
    ).click();
    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-version-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.wait('@reload', { timeout: 50000 });
    cy.wait(5000);
    cy.get('[data-cy="AlertList"] h4[class=pf-c-alert__title]').should(
      'have.text',
      'Success alert:Collection "my_collection v1.0.0" has been successfully deleted.',
    );
  });

  it('should copy collection version to validated repository', () => {
    const rand = Math.floor(Math.random() * 9999999);
    const namespace = `foo_${rand}`;
    const collection = `bar_${rand}`;
    cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);

    cy.get('[data-cy="kebab-toggle"]').click();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();

    cy.contains('Select repositories');
    cy.get(
      '[data-cy="ApproveModal-CheckboxRow-row-published"] .pf-c-table__check input',
    ).should('be.disabled');

    cy.get("[aria-label='name__icontains']").type('validate{enter}');
    cy.get(
      "[data-cy='ApproveModal-CheckboxRow-row-validated'] .pf-c-table__check input",
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.0 from "staging" to repository "validated".`,
    );
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');
  });
});
