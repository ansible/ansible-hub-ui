const uiPrefix = Cypress.env('uiPrefix');

describe('Collection detail', () => {
  const baseURL = `${uiPrefix}repo/published/collection_detail_test_namespace/collection_detail_test_collection`;

  function deprecate() {
    cy.get('[aria-label=Actions]').click();
    cy.contains('Deprecate').click();
    cy.contains('This collection has been deprecated.', { timeout: 10000 });
  }

  function undeprecate() {
    cy.get('[aria-label=Actions]').click();
    cy.contains('Undeprecate').click();
    cy.contains('This collection has been deprecated.', {
      timeout: 10000,
    }).should('not.exist');
  }

  before(() => {
    cy.deleteNamespacesAndCollections();

    cy.galaxykit(
      '-i collection upload collection_detail_test_namespace collection_detail_test_collection',
    );
  });

  beforeEach(() => {
    cy.login();
  });

  it('can Deprecate', () => {
    cy.visit(baseURL);
    deprecate();
  });

  it('can Undeprecate', () => {
    cy.visit(baseURL);
    undeprecate();
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

      // better synchronization, wait for the rest of the page to load

      if (tab.name == 'Documentation') {
        cy.contains('.docs-container', 'Documentation');
      }

      if (tab.name == 'Import log') {
        cy.contains('.body', 'Approval status', {
          timeout: 10000,
        });
      }

      if (tab.name == 'Contents') {
        cy.contains('.body', 'Description');
      }

      if (tab.name == 'Dependencies') {
        cy.contains('.body', 'No dependencies');
      }

      if (tab.name == 'Install') {
        cy.contains('.body', 'License');
      }
    });
  });

  it('should have working UI on install tab', () => {
    cy.visit(baseURL);
    // should have Install, License and Installation strings, and correct docs link
    cy.get('.body').contains('Install');
    cy.get('.body').contains('License');
    cy.get('.body').contains('Installation');

    cy.get('.body').contains(
      `a[href="${uiPrefix}repo/published/collection_detail_test_namespace/collection_detail_test_collection/docs/"]`,
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

  it('should have working UI on docs tab', () => {
    cy.visit(`${baseURL}/docs`);
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

  it('should have a search field and the table headers on contents tab', () => {
    cy.visit(`${baseURL}/content`);
    cy.get('.body').get('input[aria-label="find-content"');
    cy.get('.body').contains('th', 'Name');
    cy.get('.body').contains('th', 'Type');
    cy.get('.body').contains('th', 'Description');
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
