const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');
const insightsLogin = Cypress.env('insightsLogin');

const waitForTaskToFinish = (task, maxRequests, level = 0) => {
  if (level === maxRequests) {
    throw `Maximum requests exceeded.`;
  }

  cy.wait(task).then(({ response }) => {
    if (response.body.state !== 'completed') {
      cy.wait(1000);
      waitForTaskToFinish(task, maxRequests, level + 1);
    }
  });
};

describe('collection tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('deletes an entire collection', () => {
    cy.createApprovedCollection('test_namespace', 'test_collection');

    cy.visit(`${uiPrefix}repo/published/test_namespace/test_collection`);

    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-collection-dropdown]').click();
    cy.get('input[id=delete_confirm]').click();

    cy.intercept(
      'DELETE',
      `${apiPrefix}v3/plugin/ansible/content/published/collections/index/test_namespace/test_collection`,
    ).as('deleteCollection');
    cy.intercept('GET', `${apiPrefix}v3/tasks/*`).as('taskStatus');

    cy.get('button').contains('Delete').click();

    cy.wait('@deleteCollection').its('response.statusCode').should('eq', 202);

    waitForTaskToFinish('@taskStatus', 10);
    cy.get('@taskStatus.last').then(() => {
      cy.get('[data-cy="AlertList"] h4[class=pf-c-alert__title]').should(
        'have.text',
        'Success alert:Collection "test_collection" has been successfully deleted.',
      );
    });
  });

  it('deletes a collection version', () => {
    cy.createApprovedCollection('my_namespace', 'my_collection');

    if (insightsLogin) {
      cy.visit(`${uiPrefix}`);
    } else {
      cy.menuGo('Collections > Collections');
    }

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
    cy.get('[data-cy="AlertList"] h4[class=pf-c-alert__title]').should(
      'have.text',
      'Success alert:Collection "my_collection v1.0.0" has been successfully deleted.',
    );
  });
});
