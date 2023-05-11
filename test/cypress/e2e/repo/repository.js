import { createGzip } from 'zlib';

const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('Repository', () => {
  before(() => {
    cy.deleteRepositories();
    cy.galaxykit(
      '-i remote create',
      'exampleTestRepository',
      'https://www.example.com/',
    );
    cy.galaxykit('-i namespace create repo_test_namespace');

    cy.galaxykit(
      `-i collection upload repo_test_namespace repo_test_collection`,
    );
    cy.galaxykit(`-i collection move repo_test_namespace repo_test_collection`);
  });

  beforeEach(() => {
    cy.login();
  });

  it('creates, edit and sync repository', () => {
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
      .type('2');

    // add remote
    cy.get('[data-cy="remote"] button').click();
    cy.contains('[data-cy="remote"]', 'rh-certified');
    cy.contains('[data-cy="remote"]', 'community');
    cy.contains('[data-cy="remote"] button', 'exampleTestRepository').click();

    cy.contains(
      '[data-cy="Page-AnsibleRepositoryEdit"] button',
      'Save',
    ).click();

    // check if edited correctly
    cy.visit(uiPrefix + 'ansible/repositories/repo1Test/');
    cy.contains(
      '[data-cy="PageWithTabs-AnsibleRepositoryDetail-details"]',
      '2',
    );

    // try to sync it
    cy.contains('button', 'Sync').click();
    cy.contains('Sync started for repository "repo1Test".');
    cy.contains('a', 'detail page').click();
    cy.contains('Failed', { timeout: 10000 });
  });

  it('adds and removes collections', () => {
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

  it('checks if collection was removed', () => {
    cy.visit(
      uiPrefix + 'ansible/repositories/repo1Test/?tab=collection-versions',
    );
    cy.contains('repo_test_collection').should('not.exist');
    cy.contains('No collection versions yet');
  });
});
