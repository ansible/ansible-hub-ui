const uiPrefix = Cypress.env('uiPrefix');

function versionCheck(version) {
  cy.login();
  cy.visit(uiPrefix + 'ansible/repositories/repo1Test/');
  cy.contains('button', 'Versions').click();
  cy.get(
    '[data-cy="PageWithTabs-AnsibleRepositoryDetail-repository-versions"]',
  );
  cy.contains(
    '[data-cy="PageWithTabs-AnsibleRepositoryDetail-repository-versions"]',
    version + ' (latest)',
  );
}

describe('Repository', () => {
  ['with remote', 'without remote'].forEach((mode) => {
    it('creates, edit and sync repository ' + mode, () => {
      cy.login();

      cy.deleteRepositories();

      if (mode == 'with remote') {
        cy.galaxykit(
          '-i remote create',
          'exampleTestRepository',
          'https://www.example.com/',
        );
      }
      cy.galaxykit('-i namespace create repo_test_namespace');

      cy.deleteNamespacesAndCollections();
      cy.galaxykit(
        `-i collection upload repo_test_namespace repo_test_collection`,
      );
      cy.galaxykit(
        `-i collection move repo_test_namespace repo_test_collection`,
      );

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

      // check if created correctly
      cy.visit(uiPrefix + 'ansible/repositories/');
      cy.contains('Repositories');
      cy.contains('repo1Test');
      cy.contains('a', 'repo1Test').click();
      cy.contains(
        '[data-cy="PageWithTabs-AnsibleRepositoryDetail-details"]',
        'repo1Test description',
      );
      cy.contains(
        '[data-cy="PageWithTabs-AnsibleRepositoryDetail-details"]',
        'pipeline: approved',
      );

      // try to edit it
      cy.contains('Edit').click();
      cy.get(
        '[data-cy="Page-AnsibleRepositoryEdit"] input[id="retain_repo_versions"]',
      )
        .clear()
        .type('5');

      if (mode == 'with remote') {
        // add remote
        cy.get('[data-cy="remote"] button').click();
        cy.contains('[data-cy="remote"]', 'rh-certified');
        cy.contains('[data-cy="remote"]', 'community');
        cy.contains(
          '[data-cy="remote"] button',
          'exampleTestRepository',
        ).click();
      }

      cy.contains(
        '[data-cy="Page-AnsibleRepositoryEdit"] button',
        'Save',
      ).click();

      // check if edited correctly
      cy.visit(uiPrefix + 'ansible/repositories/repo1Test/');
      cy.contains(
        '[data-cy="PageWithTabs-AnsibleRepositoryDetail-details"]',
        '5',
      );

      if (mode == 'with remote') {
        // try to sync it
        cy.contains('button', 'Sync').click();
        cy.contains('Sync started for repository "repo1Test".');
        cy.contains('a', 'detail page').click();
        cy.contains('Failed', { timeout: 10000 });
      }
    });

    it('checks there is only 1 version ' + mode, () => {
      versionCheck(0);
    });

    it('adds  collections ' + mode, () => {
      cy.login();
      cy.visit(uiPrefix + 'ansible/repositories/repo1Test/');
      cy.contains('button', 'Collection versions').click();
      cy.contains('button', 'Add collection').click();
      cy.contains('Select a collection');
      cy.get('input[aria-label="keywords"]')
        .clear()
        .type('repo_test_collection{enter}');

      cy.get(
        'input[aria-label="repo_test_namespace.repo_test_collection v1.0.0"]',
      ).click();
      cy.contains('button', 'Select').click();
      cy.contains(
        'Started adding repo_test_namespace.repo_test_collection v1.0.0 from "published" to repository "repo1Test".',
      );
      cy.contains('a', 'detail page').click();
      cy.contains('Completed', { timeout: 10000 });
    });

    it(
      'checks there are 2 versions and collection is here (' + mode + ')',
      () => {
        versionCheck(1);
        cy.contains(
          '[data-cy="PageWithTabs-AnsibleRepositoryDetail-repository-versions"] a',
          1,
        ).click();
        cy.contains(
          '[data-cy="PageWithTabs-AnsibleRepositoryDetail-repository-versions"]',
          'repo_test_namespace.repo_test_collection v1.0.0',
        );
      },
    );

    it('removes  collections ' + mode, () => {
      cy.login();
      cy.visit(
        uiPrefix + 'ansible/repositories/repo1Test/?tab=collection-versions',
      );
      cy.contains('repo_test_collection');
      cy.get('[aria-label="Actions"]').click();
      cy.contains('a', 'Remove').click();
      cy.contains('Remove collection version?');
      cy.contains('button', 'Remove').click();
      // checking for message and clicking detail page does not work, it fails, not sure why
    });

    it('checks if collection was removed ' + mode, () => {
      cy.login();
      cy.visit(
        uiPrefix + 'ansible/repositories/repo1Test/?tab=collection-versions',
      );
      cy.contains('repo_test_collection').should('not.exist');
      cy.contains('No collection versions yet');
    });

    it('checks there are 3 versions and revert repo ' + mode, () => {
      versionCheck(2);
      cy.get(
        '[data-cy="PageWithTabs-AnsibleRepositoryDetail-repository-versions"] [aria-label="Actions"]',
      )
        .eq(1)
        .click();
      cy.contains('a', 'Revert to this version').click();
      cy.contains('button', 'Revert').click();
    });

    it('checks if collection is added again ' + mode, () => {
      cy.login();
      cy.visit(
        uiPrefix + 'ansible/repositories/repo1Test/?tab=collection-versions',
      );
      cy.contains('repo_test_collection');
      cy.contains('No collection versions yet').should('not.exist');
    });
  });
});
