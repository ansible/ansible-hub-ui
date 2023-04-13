import { range } from 'lodash';

const uiPrefix = Cypress.env('uiPrefix');
const apiPrefix = Cypress.env('apiPrefix');

function openModal(menu) {
  cy.visit(`${uiPrefix}approval-dashboard`);
  cy.contains('Clear all filters').click();

  if (menu) {
    cy.get(
      '[data-cy^="CertificationDashboard-row"] [aria-label="Actions"]',
    ).click();
    cy.contains('a', 'Sign and approve').click();
  } else {
    cy.contains(
      '[data-cy^="CertificationDashboard-row"] button',
      'Sign and approve',
    ).click();
  }

  cy.contains('Select repositories');
}

function toggleItem(name) {
  cy.get('.modal-body [data-cy="compound_filter"] input')
    .clear()
    .type(name + '{enter}');
  cy.get(`[data-cy="ApproveModal-CheckboxRow-row-${name}"] input`).click();
}

const reposList = [];

describe('Approval Dashboard process with multiple repos', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'namespace');
    cy.galaxykit('-i collection upload', 'namespace', 'collection1');

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

    cy.request(apiPrefix + 'pulp/api/v3/repositories/ansible/ansible/').then(
      (data) => {
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
          cy.galaxykit(
            `-i repository create`,
            'repo' + i,
            '--pipeline=approved',
          );
          cy.galaxykit('-i distribution create', 'repo' + i);
        });
        cy.galaxykit('-i task wait all');
      },
    );

    // prepare another staging
    cy.galaxykit('-i distribution delete', 'staging2');
    cy.galaxykit('-i repository delete', 'staging2');

    cy.galaxykit('-i repository create', 'staging2', '--pipeline=staging');
    cy.galaxykit('-i distribution create', 'staging2');
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test paging.', () => {
    openModal();
    cy.contains('.modal-body .toolbar', '1 - 10 of 11');
    cy.contains('.modal-body', 'repo1');
    cy.contains('.modal-body', 'published');
    cy.get('.modal-body .toolbar [data-action="next"]').click();
    cy.contains('.modal-body .toolbar', '11 - 11 of 11');
    cy.contains('.modal-body', 'repo9');
  });

  it('should test ordering.', () => {
    openModal();
    cy.contains('.modal-body', 'repo9').should('not.exist');
    cy.get('.modal-body [data-cy="sort_name"]').click();
    cy.contains('.modal-body', 'repo9');
    cy.contains('.modal-body', 'published').should('not.exist');
  });

  it('should test filtering.', () => {
    openModal();
    cy.contains('.modal-body', 'repo9').should('not.exist');
    cy.get('.modal-body [data-cy="compound_filter"] input').type('repo{enter}');
    cy.contains('.modal-body', 'repo9');
    cy.contains('.modal-body', 'repo1');
    cy.contains('.modal-body', 'published').should('not.exist');

    cy.get('.modal-body [data-cy="compound_filter"] input')
      .clear()
      .type('repo2{enter}');
    cy.contains('.modal-body', 'repo2');
    cy.contains('.modal-body', 'repo1').should('not.exist');
    cy.contains('.modal-body', 'published').should('not.exist');
  });

  it('should test select/deselect all/page.', () => {
    openModal();

    // select all
    cy.get('.toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Select all (11 items)').click();
    cy.contains('[aria-label="Label group category"] button', '8 more').click();
    reposList.forEach((repo) => {
      cy.contains('[aria-label="Label group category"]', repo);
    });

    // deselect all
    cy.get('.toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Deselect all (11 items)').click();
    reposList.forEach((repo) => {
      cy.contains('[aria-label="Label group category"]', repo).should(
        'not.exist',
      );
    });

    // select page
    cy.get('.toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Select page (10 items)').click();
    reposList.forEach((repo) => {
      if (repo != 'repo9') {
        cy.contains('[aria-label="Label group category"]', repo);
      } else {
        cy.contains('[aria-label="Label group category"]', repo).should(
          'not.exist',
        );
      }
    });

    // select repo9
    toggleItem('repo9');
    cy.contains('Clear all filters').click();

    // deselect page and repo9 should remain here
    cy.get('.toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Deselect page (10 items)').click();
    reposList.forEach((repo) => {
      if (repo != 'repo9') {
        cy.contains('[aria-label="Label group category"]', repo).should(
          'not.exist',
        );
      } else {
        cy.contains('[aria-label="Label group category"]', repo);
      }
    });
  });

  it('should test selection.', () => {
    openModal();
    toggleItem('repo1');
    toggleItem('published');
    cy.contains('[aria-label="Label group category"]', 'repo1');
    cy.contains('[aria-label="Label group category"]', 'published');

    toggleItem('published');
    cy.contains('[aria-label="Label group category"]', 'published').should(
      'not.exist',
    );

    toggleItem('published');
    cy.get('[aria-label="Close published"]').click();
    cy.contains('[aria-label="Label group category"]', 'published').should(
      'not.exist',
    );
  });
});
