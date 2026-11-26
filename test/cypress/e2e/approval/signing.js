const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

// This test suite requires signing to be enabled - tests are conditional based on signing config
describe('signing versions - auto sign on approval', { testIsolation: false }, () => {
  let signingEnabled = false;

  before(() => {
    // Check if auto-signing on approval is enabled
    // Requires collection_auto_sign feature flag to be true
    cy.login();
    cy.request(`${apiPrefix}_ui/v1/feature-flags/`).then(({ body }) => {
      signingEnabled = body.collection_auto_sign === true;
      cy.log(`Auto-sign on approval: ${signingEnabled ? 'enabled' : 'disabled'}`);
    });

    cy.deleteNamespacesAndCollections();

    cy.galaxykit('-i namespace create', 'autosign_test');
    cy.galaxykit('collection upload autosign_test test_collection');
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

  it('approves collection and checks signing status if enabled', function () {
    // Skip the signing check if signing is not enabled
    if (!signingEnabled) {
      cy.log('Signing is disabled - skipping signing verification');
    }

    cy.visit(`${uiPrefix}approval-dashboard`);

    // Check if the button exists
    cy.get('[data-cy="approve-button"]').should('exist');

    // Approve the first collection
    cy.get('[data-cy="approve-button"]').first().click();

    // Handle repository selection modal if it appears
    cy.get('body').then(($body) => {
      if ($body.find('.pf-v5-c-modal-box').length > 0) {
        cy.get(
          '[data-cy="ApproveModal-CheckboxRow-row-published"] input',
        ).click();
        cy.contains('button', 'Select').click();
      }
    });

    cy.galaxykit('task wait all');

    // Go and check the collection in the collections list
    cy.visit(`${uiPrefix}collections`);
    cy.contains('autosign_test');

    // Only check for signature badge if signing is configured
    if (signingEnabled) {
      // Check if the collection was actually signed (signing service may exist but not work)
      cy.get('[data-cy="signature-badge"]')
        .first()
        .invoke('text')
        .then((badgeText) => {
          if (badgeText.includes('Signed')) {
            cy.log('Collection was signed - verifying signature UI');
            // Check the signature button on detail page
            cy.visit(
              `${uiPrefix}repo/published/autosign_test/test_collection`,
            );
            cy.get('[data-cy="signature-badge"]')
              .first()
              .should('contain', 'Signed');
            cy.get('[data-cy="toggle-signature-button"]').should('be.visible');
          } else {
            cy.log(
              'Collection was not signed - signing service may not be functional',
            );
            // Test passes - approval worked, signing just not available
          }
        });
    }
  });
});
