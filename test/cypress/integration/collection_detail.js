describe('Collection detail', () => {
  const baseURL =
    '/ui/repo/published/collection_detail_test_namespace/collection_detail_test_collection';

  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit(
      '-i collection upload collection_detail_test_namespace collection_detail_test_collection',
    );
  });

  beforeEach(() => {
    cy.login();
  });

  it('should change the url when clicking on the tabs', () => {
    cy.visit(baseURL);

    const tabs = [
      {
        name: 'Documentation',
        url: `${baseURL}/docs`,
      },
      {
        name: 'Import log',
        url: `${baseURL}/import-log`,
      },
      {
        name: 'Dependencies',
        url: `${baseURL}/dependencies`,
      },
      {
        name: 'Contents',
        url: `${baseURL}/content`,
      },
      {
        name: 'Install',
        url: `${baseURL}`,
      },
    ];

    tabs.forEach((tab) => {
      cy.contains('li a span', tab.name).click();
      cy.url().should('include', tab.url);
      // All tabs contain the repo link
      cy.contains('a', 'Repo');
    });
  });

  describe('install tab', () => {
    beforeEach(() => {
      cy.visit(baseURL);
    });

    it('should have working UI', () => {
      // should have Install, License and Installation strings, and correct docs link
      cy.get('.body').contains('Install');
      cy.get('.body').contains('License');
      cy.get('.body').contains('Installation');

      cy.get('.body').contains(
        'a[href="/ui/repo/published/collection_detail_test_namespace/collection_detail_test_collection/docs"]',
        'Go to documentation',
      );

      /*
       * This test needs some external library and custom command to test if the download had started.
       * For now it fails if the button is not there.
       */
      // should be able to download the tarball
      cy.get('[data-cy="download-collection-tarball-button"]').contains(
        'Download tarball',
      );

      // should have the correct tags
      cy.get('[data-cy="tag"]').should('have.length', 1);
      cy.get('[data-cy="tag"]:first').contains('tools');

      // should have the correct ansible version
      cy.get('[data-cy="ansible-requirement"]').contains('>=2');
    });
  });

  describe('docs tab', () => {
    beforeEach(() => {
      cy.visit(`${baseURL}/docs`);
    });

    it('should have working UI', () => {
      // should have the search field
      cy.get('.body').get('input[aria-label="find-content"');

      // should have Readme menu item
      cy.get('.sidebar').contains('Readme');

      // should still show the readme when searching readme
      cy.get('input[aria-label="find-content"').type('readme');
      cy.get('.sidebar').contains('Readme');

      // should not display readme if searching for no entry
      cy.get('input[aria-label="find-content"').type('no entry');
      cy.get('.sidebar').not(':contains("Readme")');
    });
  });

  describe('contents tab', () => {
    beforeEach(() => {
      cy.visit(`${baseURL}/content`);
    });

    it('should have a search field and the table headers', () => {
      cy.get('.body').get('input[aria-label="find-content"');
      cy.get('.body').contains('th', 'Name');
      cy.get('.body').contains('th', 'Type');
      cy.get('.body').contains('th', 'Description');
    });
  });

  it('should display import log tab', () => {
    cy.visit(`${baseURL}/import-log`);
    cy.get('.body').get('.title-bar');
    cy.get('.body').get('.message-list');
    cy.get('.body').get('.last-message');
  });

  it('should display "No Dependencies" when opening the tab', () => {
    cy.visit(`${baseURL}/dependencies`);
    cy.get('.body').contains('Dependencies');
    cy.get('.body').contains('No dependencies');
  });
});
