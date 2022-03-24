describe(['cloud'], 'cloud smoketest', () => {
      
  before(() => {

    // make the browser larger so that the menus are visible
    cy.viewport(2000, 2000);

    // handle cloud login
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');
    cy.manualCloudLogin(adminUsername, adminPassword);

    /*****************************************************
     * To reduce clutter in each test function, we'll
     * navigate to the automation hub app before each 
     * test and allow the tests to assume they are at
     * the root level of the app
     * **************************************************/

    // wait for navbar to appear
    cy.get('#nav-toggle', { timeout: 10000 }).should('be.visible');
    // wait for the ansible dashboard button to appear and then click on it
    cy.get('[data-quickstart-id="ansible_ansible-dashboard"]', { timeout: 1000 }).click();
    // wait for the automation-hub button to appear and then click on it
    cy.get('[data-quickstart-id="Automation-Hub"]', { timeout: 1000 }).click();
    // wait for the collections button to appear and then click on it
    cy.get('[data-ouia-component-id="Collections"]', { timeout: 1000 }).click();
    // wait for the the collections list to appear
    cy.get('.collection-container', { timeout: 10000 }).should('be.visible');

  });

  describe('with download', () => {

    it('can load a Collection', () => {

      // wait for collections to appear
      cy.get('.collection-container', { timeout: 10000 }).should('be.visible');

      // wait for collections to load 
      cy.get('.hub-c-card-collection-container .name a', { timeout: 1000}).should('exist');

      // click on the first available collection
      cy.get('.hub-c-card-collection-container .name a', { timeout: 1000}).first().click();

      // wait for collection detail to load
      cy.get('.info-panel', { timeout: 10000})

      // ensure the download button appears
      cy.contains('button', 'Download tarball', { timeout: 10000}).should('exist');

    });

    it('can load a Partners list of collections', () => {

      // wait for the Partners button to appear and then click on it
      cy.get('[data-ouia-component-id="Partners"]', { timeout: 1000 }).click();

      // wait for the the Partners list to appear
      cy.get('.hub-namespace-page', { timeout: 10000 }).should('be.visible');

      // click on the first available Partner
      cy.get('.hub-c-card-ns-container .pf-c-card__footer a', { timeout: 1000}).first().click()

      // wait for the summary to load
      cy.get('.namespace-detail', { timeout: 10000 }).should('be.visible');

      // ensure the upload collection button appears
      cy.contains('button', 'Upload collection').should('exist');
      
      // ensure the upload new version button appears
      cy.contains('button', 'Upload new version').should('exist');

    });

    it('can load the Repo Management page', () => {

      // wait for the Repo management button to appear and then click on it
      cy.get('[data-ouia-component-id="Repo Management"]', { timeout: 1000 }).click();

      // wait for the the repository list to appear
      cy.get('.repository-list', { timeout: 10000 }).should('be.visible');

      // ensure the get token button appears
      cy.contains('button', 'Get token').should('exist');

    });

    it('can load the Connect to hub page', () => {

      // wait for the Connect to hub button to appear and then click on it
      cy.get('[data-ouia-component-id="Connect to Hub"]', { timeout: 1000 }).click();

      // ensure the load token button appears
      cy.contains('button', 'Load token').should('exist');

    });

  });

});
