import { range } from 'lodash';

const apiPrefix = Cypress.env('apiPrefix');
const pulpPrefix = `${apiPrefix}pulp/api/v3/`;
const uiPrefix = Cypress.env('uiPrefix');

function openModal(menu) {
  cy.visit(`${uiPrefix}approval-dashboard`);
  cy.contains('Clear all filters').click();

  if (menu) {
    cy.get('[data-cy^="ApprovalRow"] [aria-label="Actions"]').click();
    cy.contains('a', 'Sign and approve').click();
  } else {
    cy.contains('[data-cy^="ApprovalRow"] button', 'Sign and approve').click();
  }

  cy.contains('Select repositories');
}

function toggleItem(name) {
  cy.get('.modal-body [data-cy="compound_filter"] input')
    .clear()
    .type(name + '{enter}');
  cy.get(`[data-cy="ApproveModal-CheckboxRow-row-${name}"] input`).click();
}

function menuActionClick(repo, action) {
  cy.get(
    `[data-cy="ApprovalRow-${repo}-namespace-collection1"] [aria-label="Actions"]`,
  ).click();
  cy.contains('[data-cy="kebab-toggle"] a', action).click();
}

function rejectItem(repo) {
  menuActionClick(repo, 'Reject');
  cy.contains(
    'Certification status for collection "namespace collection1 v1.0.0" has been successfully updated.',
    { timeout: 10000 },
  );
  cy.visit(`${uiPrefix}approval-dashboard`);
  cy.contains('Clear all filters').click();
  cy.contains(
    '[data-cy="ApprovalRow-rejected-namespace-collection1"]',
    'Rejected',
  );
}

const reposList = [];

describe('Approval Dashboard process with multiple repos', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'namespace');
    cy.galaxykit('collection upload', 'namespace', 'collection1');

    const max = 11;
    range(1, max).forEach((i) => {
      reposList.push('repo' + i);
    });

    reposList.push('published');

    cy.login();

    range(1, max).forEach((i) => {
      cy.galaxykit('-i distribution delete', 'repo' + i);
    });

    cy.galaxykit('-i task wait all');

    cy.request(`${pulpPrefix}repositories/ansible/ansible/`).then((data) => {
      const list = data.body.results;
      list.forEach((repo) => {
        if (
          repo.pulp_labels?.pipeline == 'approved' &&
          repo.name != 'published'
        ) {
          cy.log('deleting repository' + repo.name);
          cy.galaxykit('-i repository delete', repo.name);
        }
      });
      cy.galaxykit('-i task wait all');
      range(1, max).forEach((i) => {
        cy.galaxykit('-i repository create', 'repo' + i, '--pipeline=approved');
        cy.galaxykit('-i distribution create', 'repo' + i);
      });
      cy.galaxykit('-i task wait all');
    });

    // prepare another staging
    cy.galaxykit('-i distribution delete', 'staging2');
    cy.galaxykit('-i repository delete', 'staging2');

    cy.galaxykit('-i repository create', 'staging2', '--pipeline=staging');
    cy.galaxykit('-i distribution create', 'staging2');
  });

  beforeEach(() => {
    cy.login();
  });

  it('should contains no colletctions in list', () => {
    cy.visit(`${uiPrefix}collections`);
    cy.contains('No collections yet');
  });

  it('should approve, reject and reapprove', () => {
    openModal();
    toggleItem('repo1');
    toggleItem('repo2');
    toggleItem('published');
    cy.contains('button', 'Select').click();
    cy.contains(
      'Certification status for collection "namespace collection1 v1.0.0" has been successfully updated.',
      { timeout: 20000 },
    );

    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('No results found');
    cy.contains('Clear all filters').click();
    cy.contains('[aria-label="Collection versions"]', 'repo1');
    cy.contains('[aria-label="Collection versions"]', 'repo2');
    cy.contains('[aria-label="Collection versions"]', 'Published');

    rejectItem('repo1');
    rejectItem('published');

    // 2 items should be left there
    cy.contains('.hub-toolbar', '1 - 2 of 2');
    cy.get('[data-cy="ApprovalRow-rejected-namespace-collection1"]');
    cy.get('[data-cy="ApprovalRow-repo2-namespace-collection1"]');
    cy.get('[data-cy="ApprovalRow-repo1-namespace-collection1"]').should(
      'not.exist',
    );
    cy.get('[data-cy="ApprovalRow-published-namespace-collection1"]').should(
      'not.exist',
    );

    // reapprove
    menuActionClick('rejected', 'Sign and approve');
    cy.contains('Select repositories');
    toggleItem('repo1');
    cy.contains('button', 'Select').click();
    cy.contains(
      'Certification status for collection "namespace collection1 v1.0.0" has been successfully updated.',
      { timeout: 20000 },
    );

    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('Clear all filters').click();
    cy.contains('.hub-toolbar', '1 - 2 of 2');
    cy.get('[data-cy="ApprovalRow-repo2-namespace-collection1"]');
    cy.get('[data-cy="ApprovalRow-repo1-namespace-collection1"]');
    cy.get('[data-cy="ApprovalRow-published-namespace-collection1"]').should(
      'not.exist',
    );
    cy.get('[data-cy="ApprovalRow-rejected-namespace-collection1"]').should(
      'not.exist',
    );
  });

  it('should be able to approve from different staging repo', () => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'namespace');
    cy.galaxykit('collection upload', 'namespace', 'collection1');
    cy.galaxykit(
      '-i collection move',
      'namespace',
      'collection1',
      '1.0.0',
      'staging',
      'staging2',
    );

    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.get('[data-cy="ApprovalRow-staging2-namespace-collection1"]');

    openModal();
    toggleItem('repo1');
    toggleItem('repo2');
    toggleItem('published');
    cy.contains('button', 'Select').click();
    cy.contains(
      'Certification status for collection "namespace collection1 v1.0.0" has been successfully updated.',
      { timeout: 20000 },
    );

    cy.visit(`${uiPrefix}approval-dashboard`);
    cy.contains('No results found');
    cy.contains('Clear all filters').click();
    cy.contains('[aria-label="Collection versions"]', 'repo1');
    cy.contains('[aria-label="Collection versions"]', 'repo2');
    cy.contains('[aria-label="Collection versions"]', 'Published');
  });
});
