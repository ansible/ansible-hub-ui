const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('collection tests', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
  });

  beforeEach(() => {
    cy.login();
  });

  it('delete an entire collection', () => {
    cy.galaxykit('-i collection upload test_namespace test_collection');
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}repo/staging/test_namespace/test_collection`);
    cy.wait(2000);
    cy.openHeaderKebab();
    cy.get('[data-cy=delete-collection]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains('No collections yet', { timeout: 10000 });
  });

  it('delete a collection version', () => {
    cy.galaxykit('-i collection upload my_namespace my_collection');
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}collections`);

    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/my_namespace/?*`).as(
      'reload',
    );
    cy.visit(`${uiPrefix}repo/staging/my_namespace/my_collection`);
    cy.wait(3000);
    cy.openHeaderKebab();
    cy.get('[data-cy=delete-collection-version]').click();
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
    cy.deleteNamespacesAndCollections();
    const rand = Math.floor(Math.random() * 9999999);
    const namespace = `foo_${rand}`;
    const collection = `bar_${rand}`;
    cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    cy.galaxykit('task wait all');
    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);
    cy.wait(2000);
    cy.openHeaderKebab();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();

    cy.contains('Select repositories');
    cy.get(
      '[data-cy="ApproveModal-CheckboxRow-row-staging"] .pf-c-table__check input',
    ).should('be.disabled');

    cy.get("[aria-label='name__icontains']").type('validate{enter}');
    cy.get(
      "[data-cy='ApproveModal-CheckboxRow-row-validated'] .pf-c-table__check input",
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.0 from "staging" to repository "validated".`,
    );
    cy.galaxykit('task wait all');
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');
  });

  it('delete a collection from repository', () => {
    const rand = Math.floor(Math.random() * 9999999);
    const namespace = `namespace_${rand}`;
    const collection = `collection_${rand}`;
    const repo = `repo_${rand}`;
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
    cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    cy.galaxykit(`repository create ${repo} --pipeline approved`);
    cy.galaxykit(`distribution create ${repo}`);

    cy.galaxykit('task wait all');
    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);
    cy.wait(2000);
    cy.openHeaderKebab();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();
    cy.get("[aria-label='name__icontains']").type(`${repo}{enter}`);
    cy.get(
      `[data-cy='ApproveModal-CheckboxRow-row-${repo}'] .pf-c-table__check input`,
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.0 from "staging" to repository "${repo}".`,
    );
    cy.galaxykit('task wait all');
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');

    cy.visit(`${uiPrefix}collections?view_type=list`);
    cy.contains('Collections');
    cy.contains('[data-cy="CollectionListItem"]', repo);

    cy.get('.collection-container [aria-label="Actions"]:first').click({
      force: true,
    });
    cy.contains('Remove collection from repository').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains(`Collection "${collection}" has been successfully deleted.`, {
      timeout: 10000,
    });
    cy.contains('Collections');
    cy.deleteAllCollections();
    cy.deleteRepositories();
  });

  it('delete a collection version from repository', () => {
    const rand = Math.floor(Math.random() * 9999999);
    const namespace = `namespace_${rand}`;
    const collection = `collection_${rand}`;
    const repo = `repo_${rand}`;
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
    cy.galaxykit(`repository create ${repo} --pipeline approved`);
    cy.galaxykit(`distribution create ${repo}`);

    cy.galaxykit(`-i collection upload ${namespace} ${collection} 1.0.0`);
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);
    cy.wait(3000);
    cy.openHeaderKebab();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();
    cy.get("[aria-label='name__icontains']").type(`${repo}{enter}`);
    cy.get(
      `[data-cy='ApproveModal-CheckboxRow-row-${repo}'] .pf-c-table__check input`,
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.0 from "staging" to repository "${repo}".`,
    );
    cy.galaxykit('task wait all');
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');

    cy.galaxykit(`-i collection upload ${namespace} ${collection} 1.0.1`);
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}repo/staging/${namespace}/${collection}`);
    cy.wait(3000);
    cy.openHeaderKebab();
    cy.get(
      '[data-cy="copy-collection-version-to-repository-dropdown"]',
    ).click();
    cy.get("[aria-label='name__icontains']").type(`${repo}{enter}`);
    cy.get(
      `[data-cy='ApproveModal-CheckboxRow-row-${repo}'] .pf-c-table__check input`,
    ).check();

    cy.get('.pf-m-primary').contains('Select').click();

    cy.get('[data-cy="AlertList"]').contains(
      `Started adding ${namespace}.${collection} v1.0.1 from "staging" to repository "${repo}".`,
    );
    cy.galaxykit('task wait all');
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');

    cy.visit(`${uiPrefix}collections?view_type=list`);
    cy.contains('Collections');
    cy.contains('[data-cy="CollectionListItem"]', repo);
    cy.visit(
      `${uiPrefix}repo/${repo}/${namespace}/${collection}/?version=1.0.0`,
    );
    cy.wait(3000);
    cy.openHeaderKebab();
    cy.contains('Remove version 1.0.0 from repository').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains(
      `Collection "${collection} v1.0.0" has been successfully deleted.`,
      {
        timeout: 10000,
      },
    );

    cy.visit(
      `${uiPrefix}repo/${repo}/${namespace}/${collection}/?version=1.0.0`,
    );
    cy.contains(`We couldn't find the page you're looking for!`);
    cy.visit(
      `${uiPrefix}repo/staging/${namespace}/${collection}/?version=1.0.1`,
    );
    cy.contains(collection);
    cy.contains(`We couldn't find the page you're looking for!`).should(
      'not.exist',
    );

    cy.deleteAllCollections();
    cy.deleteRepositories();
  });
});
