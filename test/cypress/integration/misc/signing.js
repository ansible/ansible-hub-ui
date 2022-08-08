describe('signing versions', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  describe.skip('auto sign on approval', () => {
    before(() => {
      cy.settings({
        GALAXY_AUTO_SIGN_COLLECTIONS: true,
        GALAXY_REQUIRE_CONTENT_APPROVAL: true,
        GALAXY_COLLECTION_SIGNING_SERVICE: 'ansible-default',
      }).then(() => {
        cy.galaxykit('-i namespace create', 'autosign_test');
        cy.galaxykit('-i collection upload autosign_test test_collection');
      });
    });

    after(() => {
      cy.settings();
      cy.deleteNamespacesAndCollections();
    });

    beforeEach(() => {
      cy.login();
    });

    it('has the switch to sync only certified repos', () => {
      cy.visit('/ui/repositories?tab=remote');
      cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
      cy.contains('Edit').click();
      cy.contains('Show advanced options').click();
      cy.get('#signed_only').should('exist');
    });

    it('signs when the Sign and Approve button is pressed', () => {
      cy.visit('/ui/approval-dashboard');

      // Check if the button is correctly worded
      cy.get('[data-cy="approve-button"]').should(
        'contain',
        'Sign and approve',
      );

      // Sign the first collection
      cy.get('[data-cy="approve-button"]').first().click();

      // TODO: Maybe we can wait on some specific event?
      cy.wait(10000);

      // Go and check if it is signed in the collections
      cy.visit('/ui/repo/published');
      cy.get('[data-cy="signature-badge"]', { timeout: 20000 }).should(
        'have.length',
        1,
      );
      cy.get('[data-cy="signature-badge"]').first().should('contain', 'Signed');

      // Optimization: check the signature button too here
      cy.visit('/ui/repo/published/autosign_test/test_collection');
      cy.get('[data-cy="signature-badge"]').first().should('contain', 'Signed');
      cy.get('[data-cy="toggle-signature-button"]').should('be.visible');
    });
  });

  describe.skip('sign after approval', () => {
    before(() => {
      cy.settings({
        GALAXY_AUTO_SIGN_COLLECTIONS: false,
        GALAXY_REQUIRE_CONTENT_APPROVAL: false,
        GALAXY_COLLECTION_SIGNING_SERVICE: 'ansible-default',
      }).then(() => {
        cy.galaxykit('-i namespace create', 'namespace_signing_test');
        cy.galaxykit('-i collection upload namespace_signing_test collection1');
        cy.galaxykit('-i collection upload namespace_signing_test collection2');

        cy.galaxykit('-i namespace create', 'collection_signing_test');
        cy.galaxykit(
          '-i collection upload collection_signing_test collection1 1.0.0',
        );
        cy.galaxykit(
          '-i collection upload collection_signing_test collection1 2.0.0',
        );
        cy.galaxykit(
          '-i collection upload collection_signing_test collection2 1.0.0',
        );
        cy.galaxykit(
          '-i collection upload collection_signing_test collection2 2.0.0',
        );
      });
    });

    after(() => {
      cy.settings();
      cy.deleteNamespacesAndCollections();
    });

    beforeEach(() => {
      cy.login();
    });

    it('can sign all collections and versions from the namespace screen', () => {
      cy.visit('/ui/repo/published/namespace_signing_test');

      // Make sure it is unsigned at first
      cy.get('[data-cy="signature-badge"]')
        .first()
        .should('contain', 'Unsigned');

      // Sign
      cy.get('[aria-label="Actions"]').first().click();
      cy.get('[data-cy="sign-all-collections-button"]').click();

      // Optimization: Check if the unsigned/signed numbers are correct in the modal
      cy.get('[data-cy="signed-number-badge"').should('contain', '0');
      cy.get('[data-cy="unsigned-number-badge"').should('contain', '2');

      cy.get('[data-cy="modal-sign-button"]').click();

      // Check if it is signed
      cy.get('[data-cy="signature-badge"]:first', { timeout: 20000 }).should(
        'contain',
        'Signed',
      );
      cy.get('[data-cy="signature-badge"]').eq(1).should('contain', 'Signed');
    });

    it('can sign a single version in the collection from collection details', () => {
      cy.visit('/ui/repo/published/collection_signing_test/collection1');

      // Make sure it is unsigned at first
      cy.get('[data-cy="signature-badge"]')
        .first()
        .should('contain', 'Unsigned');

      // Sign
      cy.get('[aria-label="Actions"]').click();
      cy.get('[data-cy="sign-version-button"]').click();
      cy.get('[data-cy="modal-sign-button"]').click();

      // Check if it is signed
      cy.get('[data-cy="signature-badge"]:first', { timeout: 20000 }).should(
        'contain',
        'Signed',
      );
      cy.get('[aria-label="Actions"]').first().click();
      cy.get('[data-cy="sign-collection-button"]').click();
      cy.get('[data-cy="signed-number-badge"').should('contain', '1');
      cy.get('[data-cy="unsigned-number-badge"').should('contain', '1');
    });

    it('can sign all version in the collection from collection details', () => {
      cy.visit('/ui/repo/published/collection_signing_test/collection2');

      // Make sure it is unsigned at first
      cy.get('[data-cy="signature-badge"]')
        .first()
        .should('contain', 'Unsigned');

      // Sign
      cy.get('[aria-label="Actions"]').first().click();
      cy.get('[data-cy="sign-collection-button"]').click();

      // Optimization: Check if the unsigned/signed numbers are correct in the modal
      cy.get('[data-cy="signed-number-badge"').should('contain', '0');
      cy.get('[data-cy="unsigned-number-badge"').should('contain', '2');

      cy.get('[data-cy="modal-sign-button"]').click();

      // Check if it is signed
      cy.get('[data-cy="signature-badge"]:first', { timeout: 10000 }).should(
        'contain',
        'Signed',
      );

      // Check in the modal too
      cy.get('[aria-label="Actions"]').first().click();
      cy.get('[data-cy="sign-collection-button"]').click();
      cy.get('[data-cy="signed-number-badge"').should('contain', '2');
      cy.get('[data-cy="unsigned-number-badge"').should('contain', '0');
    });
  });

  describe.skip('certificate upload', () => {
    const defaultSettings = {
      GALAXY_SIGNATURE_UPLOAD_ENABLED: true,
      GALAXY_AUTO_SIGN_COLLECTIONS: false,
      GALAXY_COLLECTION_SIGNING_SERVICE: 'ansible-default',
    };

    before(() => {
      cy.galaxykit('-i namespace create', 'certificate_upload_test');
    });

    after(() => {
      cy.settings();
      cy.deleteNamespacesAndCollections();
    });

    beforeEach(() => {
      cy.login();
    });

    it.skip('should upload certificate before approval', () => {
      cy.settings({
        ...defaultSettings,
        GALAXY_REQUIRE_CONTENT_APPROVAL: true,
      });
      cy.galaxykit('-i collection upload certificate_upload_test col1');

      return;
    });

    it.skip('should be able to upload certificate ONLY for a version after approval', () => {
      cy.settings({
        ...defaultSettings,
        GALAXY_REQUIRE_CONTENT_APPROVAL: false,
      });
      cy.galaxykit('-i collection upload certificate_upload_test col2');

      return;
    });
  });
});
