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

describe('Approval Dashboard process with multiple repos', () => {
  before(() => {
    cy.galaxykit('-i namespace create', 'namespace');
    cy.galaxykit('-i collection upload', 'namespace', 'collection1');
    cy.galaxykit('-i task wait all');

    cy.login();

    cy.galaxykit('-i repository create', 'staging2', '--pipeline=staging');
    cy.galaxykit('-i distribution create', 'staging2');
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test paging.', () => {
    openModal();
    cy.contains('.modal-body .hub-toolbar', '1 - 10 of 11');
    cy.contains('.modal-body', 'repo1');
    cy.contains('.modal-body', 'published');
    cy.get('.modal-body .hub-toolbar [data-action="next"]').click();
    cy.contains('.modal-body .hub-toolbar', '11 - 11 of 11');
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

    // deselect all
    cy.get('.hub-toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Deselect all (0 items)').click();

    // select page
    cy.get('.hub-toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Select page (10 items)').click();
    cy.contains('.pf-c-label.pf-m-overflow', 'more').click();

    // select repo9
    toggleItem('repo9');
    cy.contains('Clear all filters').click();

    // deselect page and repo9 should remain here
    cy.get('.hub-toolbar [aria-label="Select"] svg').click();
    cy.contains('a', 'Deselect page (10 items)').click();
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
