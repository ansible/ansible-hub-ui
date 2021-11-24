describe('Collection detail', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  function tabClick(name) {
    cy.contains('li a span', name).click();
    // repo link must be in all tabs
    cy.contains('a', 'Repo');
  }

  before(() => {
    cy.galaxykit(
      '-i collection upload collection_detail_test_namespace collection_detail_test_collection',
    );
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.visit(
      '/ui/repo/published/collection_detail_test_namespace/collection_detail_test_collection',
    );
  });

  it('tab Install is working and documentation link is working', () => {
    tabClick('Install');
    cy.get('.body').contains('Install');
    cy.get('.body').contains('License');
    cy.get('.body').contains('Installation');

    cy.get('.body').contains(
      'a[href="/ui/repo/published/collection_detail_test_namespace/collection_detail_test_collection/docs"]',
      'Go to documentation',
    );
  });

  it('tab Documentation is working', () => {
    tabClick('Documentation');
    cy.get('.body').get('input[aria-label="find-content"');
  });

  it('tab Contents is working', () => {
    tabClick('Contents');
    cy.get('.body').get('input[aria-label="find-content"');
    cy.get('.body').contains('th', 'Name');
    cy.get('.body').contains('th', 'Type');
    cy.get('.body').contains('th', 'Description');
  });

  it('tab Import log is working', () => {
    tabClick('Import log');
    cy.get('.body').get('.title-bar');
    cy.get('.body').get('.message-list');
    cy.get('.body').get('.last-message');
  });

  it('tab Dependencies is working', () => {
    tabClick('Dependencies');
    cy.get('.body').contains('Dependencies');
    cy.get('.body').contains('No dependencies');
  });
});
