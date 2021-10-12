describe('view-only mode', () => {
  describe('with download', () => {
    before(() => {
      cy.settings({
        GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: true,
        GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD: true,
      });
    });

    it('has limited menu, nav', () => {
      cy.visit('/');

      [
        'Collections > Collections',
        'Collections > Namespaces',
        'Documentation',
      ].forEach((item) => cy.menuPresent(item));

      [
        'Collections > Repository Management',
        'Collections > API Token',
        'Collections > Approval',
        'Execution Environments > Execution Environments',
        'Execution Environments > Remote Registries',
        'Task Management',
        'User Access > Users',
        'User Access > Groups',
      ].forEach((item) => cy.menuMissing(item));

      // login button in top right nav
      cy.contains('.pf-c-page__header-tools a', 'Login');
    });

    it('can load Collections', () => {
      cy.visit('/');
      cy.contains('.pf-c-title', 'Collections');

      // go to a detail screen
      cy.get('.pf-c-card__header .name a').first().click();

      cy.contains('.pf-c-button', 'Download tarball');
    });

    it('can load Namespaces', () => {
      cy.visit('/ui/namespaces');
      cy.contains('.pf-c-title', 'Namespaces');

      cy.contains('button', 'Create').should('not.exist');
      cy.contains('.pf-c-tabs__item a', 'My namespaces').should('not.exist');

      // go to a (namespace) detail screen
      cy.contains('a', 'View collections');

      cy.contains('button', 'Upload collection').should('not.exist');
      cy.contains('button', 'Upload new version').should('not.exist');
    });

    it('gets Unauthorized elsewhere', () => {
      cy.visit('/ui/repositories');
      cy.contains('You do not have access to Automation Hub');
      cy.contains('.pf-c-button', 'Login');
    });
  });

  describe('without download', () => {
    before(() => {
      cy.settings({
        GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: true,
        GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD: false,
      });
    });

    it("can't download collections", () => {
      cy.visit('/');
      cy.contains('.pf-c-title', 'Collections');

      // go to a detail screen
      cy.get('.pf-c-card__header .name a').first().click();

      cy.contains(
        '.pf-c-alert.pf-m-warning',
        'You have to be logged in to be able to download the tarball',
      );
      cy.contains('.pf-c-button', 'Download tarball').should('not.exist');
    });
  });

  after(() => {
    cy.settings(); // reset
  });
});
