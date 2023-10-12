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

  it('deletes an entire collection', () => {
    cy.galaxykit('-i collection upload test_namespace test_collection');
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}repo/published/test_namespace/test_collection`);

    cy.get('[data-cy=kebab-toggle]').click();
    cy.get('[data-cy=delete-collection]').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains('No collections yet', { timeout: 10000 });
  });

  it('deletes a collection version', () => {
    cy.galaxykit('-i collection upload my_namespace my_collection');
    cy.galaxykit('task wait all');

    cy.visit(`${uiPrefix}collections`);

    cy.intercept('GET', `${apiPrefix}_ui/v1/namespaces/my_namespace/?*`).as(
      'reload',
    );
    cy.get(
      `a[href*="${uiPrefix}repo/published/my_namespace/my_collection"]`,
    ).click();
    cy.get('[data-cy=kebab-toggle]').click();
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
    cy.visit(`${uiPrefix}repo/published/${namespace}/${collection}`);

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
      `Started adding ${namespace}.${collection} v1.0.0 from "published" to repository "validated".`,
    );
    cy.galaxykit('task wait all');
    cy.get('[data-cy="AlertList"]').contains('detail page').click();
    cy.contains('Completed');
  });

  it('deletes an collection from repository', () => {
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
    cy.galaxykit('-i collection upload test_namespace test_repo_collection2');
    cy.galaxykit('repository create repo2 --pipeline approved');
    cy.galaxykit('distribution create repo2');

    cy.galaxykit('task wait all');
    cy.galaxykit(
      'collection copy test_namespace test_repo_collection2 1.0.0 published repo2',
    );

    cy.visit(`${uiPrefix}collections?view_type=list`);
    cy.contains('Collections');
    cy.contains('[data-cy="CollectionListItem"]', 'published');
    cy.contains('[data-cy="CollectionListItem"]', 'repo2');

    cy.get('.collection-container [aria-label="Actions"]:first').click({
      force: true,
    });
    cy.contains('Delete collection from repository').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains(
      'Collection "test_repo_collection2" has been successfully deleted.',
      {
        timeout: 10000,
      },
    );
    cy.contains('[data-cy="CollectionListItem"]', 'repo2');
    cy.contains('[data-cy="CollectionListItem"]', 'published').should(
      'not.exist',
    );

    cy.deleteAllCollections();
    cy.deleteRepositories();
  });

  it('deletes an collection version from repository', () => {
    cy.deleteNamespacesAndCollections();
    cy.deleteRepositories();
    cy.galaxykit('repository create repo2 --pipeline approved');
    cy.galaxykit('distribution create repo2');

    cy.galaxykit(
      '-i collection upload test_namespace test_repo_collection_version2 1.0.0',
    );
    cy.galaxykit('task wait all');
    cy.galaxykit(
      'collection copy test_namespace test_repo_collection_version2 1.0.0 published repo2',
    );

    cy.galaxykit(
      '-i collection upload test_namespace test_repo_collection_version2 1.0.1',
    );
    cy.galaxykit('task wait all');
    cy.galaxykit(
      'collection copy test_namespace test_repo_collection_version2 1.0.1 published repo2',
    );

    cy.visit(`${uiPrefix}collections?view_type=list`);
    cy.contains('Collections');
    cy.contains('[data-cy="CollectionListItem"]', 'published');
    cy.contains('[data-cy="CollectionListItem"]', 'repo2');

    cy.visit(
      `${uiPrefix}repo/repo2/test_namespace/test_repo_collection_version2/?version=1.0.0`,
    );

    cy.get('[data-cy="kebab-toggle"] [aria-label="Actions"]:first').click();
    cy.contains('Delete version 1.0.0 from repository').click();
    cy.get('input[id=delete_confirm]').click();
    cy.get('button').contains('Delete').click();
    cy.contains(
      'Collection "test_repo_collection_version2 v1.0.0" has been successfully deleted.',
      {
        timeout: 10000,
      },
    );

    cy.visit(
      `${uiPrefix}repo/repo2/test_namespace/test_repo_collection_version2/?version=1.0.0`,
    );
    cy.contains(`We couldn't find the page you're looking for!`);

    cy.visit(
      `${uiPrefix}repo/published/test_namespace/test_repo_collection_version2/?version=1.0.0`,
    );
    cy.contains('test_repo_collection_version2');
    cy.contains(`We couldn't find the page you're looking for!`).should(
      'not.exist',
    );

    cy.deleteAllCollections();
    cy.deleteRepositories();
  });
});
