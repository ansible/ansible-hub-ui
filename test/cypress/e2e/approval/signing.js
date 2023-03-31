const uiPrefix = Cypress.env('uiPrefix');

describe('signing versions - auto sign on approval', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit('-i namespace create', 'autosign_test');
    cy.galaxykit('-i collection upload autosign_test test_collection');
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
  });

  it('has the switch to sync only certified repos', () => {
    cy.visit(`${uiPrefix}ansible/remotes`);
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('#signed_only').should('exist');
  });

  it('signs when the Sign and Approve button is pressed', () => {
    cy.visit(`${uiPrefix}approval-dashboard`);

    // Check if the button is correctly worded
    cy.get('[data-cy="approve-button"]').should('contain', 'Sign and approve');

    // Sign the first collection
    cy.get('[data-cy="approve-button"]').first().click();

    // TODO: Maybe we can wait on some specific event?
    cy.wait(10000);

    // Go and check if it is signed in the collections
    cy.visit(`${uiPrefix}collections`);
    cy.get('[data-cy="signature-badge"]', { timeout: 20000 }).should(
      'have.length',
      1,
    );
    cy.get('[data-cy="signature-badge"]').first().should('contain', 'Signed');

    // Optimization: check the signature button too here
    cy.visit(`${uiPrefix}repo/published/autosign_test/test_collection`);
    cy.get('[data-cy="signature-badge"]').first().should('contain', 'Signed');
    cy.get('[data-cy="toggle-signature-button"]').should('be.visible');
  });
});
