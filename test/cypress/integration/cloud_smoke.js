/*******************************************************
 * This has only been tested against stage. It is
 * uncertain if it will work against an ephemeral
 * environment -yet-, but that will happen eventually
 *******************************************************/

// there is a LOT of delay in the cloud environments
// default timeouts that would have been sufficient for
// ui testing on standalone are NOT sufficient in the cloud
const cKwargs = { timeout: 10000 };

describe(['cloud'], 'cloud smoketest', () => {
  before(() => {
    // TODO create a single collection ...
    const suffix = Math.floor(Math.random() * 10000);
    const collectionNamespace = `namespace_${suffix}`;
    const collectionName = `collection_${suffix}`;
    cy.galaxykit(`namespace create ${collectionNamespace}`);
    cy.galaxykit(`collection upload ${collectionNamespace} ${collectionName}`);
    cy.galaxykit(`collection move ${collectionNamespace} ${collectionName}`);

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
    cy.get('#nav-toggle', cKwargs).should('be.visible');
    // wait for the ansible dashboard button to appear and then click on it
    cy.get('[data-quickstart-id="ansible_ansible-dashboard"]', cKwargs).click();
    // wait for the automation-hub button to appear and then click on it
    cy.get('[data-quickstart-id="Automation-Hub"]', cKwargs).click();
    // wait for the collections button to appear and then click on it
    cy.get('[data-ouia-component-id="Collections"]', cKwargs).click();
    // wait for the the collections list to appear
    cy.get('.collection-container', cKwargs).should('be.visible');
  });

  describe('with download', () => {
    it('can load a Collection', () => {
      // TODO create a single collection ...
      //cy.galaxykit('namespace create my_namespace');
      //cy.galaxykit('-i collection upload my_namespace my_collection');

      // wait for collections to appear
      cy.get('.collection-container', cKwargs).should('be.visible');

      // wait for collections to load
      //cy.get('.hub-c-card-collection-container .name a', cKwargs).should(
      cy.get('.collection-card-container .name a', cKwargs).should('exist');

      // click on the first available collection
      //cy.get('.hub-c-card-collection-container .name a', cKwargs)
      cy.get('.collection-card-container .name a', cKwargs).first().click();

      // wait for collection detail to load
      cy.get('.info-panel', cKwargs);

      // ensure the download button appears
      cy.contains('button', 'Download tarball', cKwargs).should('exist');
    });

    it('can load a Partners list of collections', () => {
      // TODO create a single collection ...
      //cy.galaxykit('namespace create my_namespace');
      //cy.galaxykit('-i collection upload my_namespace my_collection');

      // wait for the Partners button to appear and then click on it
      cy.get('[data-ouia-component-id="Partners"]', cKwargs).click();

      // wait for the the Partners list to appear
      //cy.get('.hub-namespace-page', cKwargs).should('be.visible');
      cy.get('.namespace-page', cKwargs).should('be.visible');

      // click on the first available Partner
      //cy.get('.hub-c-card-ns-container .pf-c-card__footer a', cKwargs)
      cy.get('.ns-card-container .pf-c-card__footer a', cKwargs)
        .first()
        .click();

      // wait for the summary|list to load
      //cy.get('.namespace-detail', cKwargs).should('be.visible');
      cy.get('[aria-label="List of Collections"]', cKwargs).should(
        'be.visible',
      );

      // ensure the upload collection button appears
      cy.contains('button', 'Upload collection').should('exist');

      // ensure the upload new version button appears
      cy.contains('button', 'Upload new version').should('exist');
    });

    it('can load the Repo Management page', () => {
      // wait for the Repo management button to appear and then click on it
      cy.get('[data-ouia-component-id="Repo Management"]', cKwargs).click();

      // wait for the the repository list to appear
      cy.get('.repository-list', cKwargs).should('be.visible');

      // ensure the get token button appears ... NOT IN EPHEMERAL?
      //cy.contains('button', 'Get token').should('exist');
    });

    it('can load the Connect to hub page', () => {
      // wait for the Connect to hub button to appear and then click on it
      cy.get('[data-ouia-component-id="Connect to Hub"]', cKwargs).click();

      // ensure the load token button appears
      cy.contains('button', 'Load token').should('exist');
    });
  });
});
