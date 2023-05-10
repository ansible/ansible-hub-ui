const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Repository', () => {
  before(() => {
    cy.deleteRepositories();
  });

  beforeEach(() => {
    cy.login();
  });

  it('Create repository', () => {
    cy.visit(uiPrefix + 'ansible/repositories');
    cy.contains('Repositories');
    cy.contains('button', 'Add repository').click();
    cy.contains('Add new repository');
    cy.get('[data-cy="Page-AnsibleRepositoryEdit"] input[id="name"]').type(
      'repo1Test',
    );
    cy.get(
      '[data-cy="Page-AnsibleRepositoryEdit"] input[id="description"]',
    ).type('repo1Test description');

    cy.get('[data-cy="pipeline"] button').click();
    cy.contains('[data-cy="pipeline"]', 'Staging');
    cy.contains('[data-cy="pipeline"]', 'Approved');
    cy.contains('[data-cy="pipeline"]', 'None');

    cy.contains('[data-cy="pipeline"] button', 'Approved').click();
    cy.contains(
      '[data-cy="Page-AnsibleRepositoryEdit"] button',
      'Save',
    ).click();
  });
});
