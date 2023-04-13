describe('cloud smoketest', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    // create a single collection ...
    const suffix = Math.floor(Math.random() * 10000);
    const collectionNamespace = `namespace_${suffix}`;
    const collectionName = `collection_${suffix}`;
    cy.galaxykit(`namespace create ${collectionNamespace}`);
    cy.galaxykit(`collection upload ${collectionNamespace} ${collectionName}`);
    cy.galaxykit(`collection move ${collectionNamespace} ${collectionName}`);

    // create some collections for autohubtest2 and autohubtest3
    // in case those are the first namespaces in the list
    cy.galaxykit(`collection upload autohubtest2 ${collectionName}2`);
    cy.galaxykit(`collection move autohubtest2 ${collectionName}2`);
    cy.galaxykit(`collection upload autohubtest3 ${collectionName}3`);
    cy.galaxykit(`collection move autohubtest3 ${collectionName}3`);

    // handle cloud login
    cy.login();

    /*****************************************************
     * To reduce clutter in each test function, we'll
     * navigate to the automation hub app before each
     * test and allow the tests to assume they are at
     * the root level of the app
     * **************************************************/

    // wait for navbar to appear
    cy.get('.pf-c-page__sidebar').should('be.visible');
    // wait for the automation-hub button to appear and then click on it
    cy.get('[data-quickstart-id="Automation-Hub"]').click();
    // wait for the collections button to appear and then click on it
    cy.get('[data-ouia-component-id="Collections"]').click();
    // wait for the the collections list to appear
    cy.get('.collection-container').should('be.visible');
  });

  describe('with download', () => {
    it('can load a Collection', () => {
      // wait for collections to appear
      cy.get('.collection-container').should('be.visible');

      // wait for collections to load
      cy.get('.hub-c-card-collection-container .name a').should('exist');

      // click on the first available collection
      cy.get('.hub-c-card-collection-container .name a').first().click();

      // wait for collection detail to load
      cy.get('.info-panel');

      // ensure the download button appears
      cy.contains('button', 'Download tarball').should('exist');
    });

    it('can load a Partners list of collections', () => {
      cy.login();
      // wait for the Partners button to appear and then click on it
      cy.get('[data-ouia-component-id="Partners"]').click();

      // wait for the the Partners list to appear
      cy.get('.hub-namespace-page').should('be.visible');

      // click on the first available Partner
      cy.get('.hub-c-card-ns-container .pf-c-card__footer a').first().click();

      // wait for the summary|list to load
      cy.get('[aria-label="List of Collections"]').should('be.visible');

      // ensure the upload collection button appears
      cy.contains('button', 'Upload collection').should('exist');

      // ensure the upload new version button appears
      cy.contains('button', 'Upload new version').should('exist');
    });

    it.skip('can load the Repo Management page', () => {
      cy.login();
      // wait for the Repo management button to appear and then click on it
      cy.get('[data-ouia-component-id="Repositories"]').click();

      // wait for the the repository list to appear
      cy.get('.repository-list').should('be.visible');
    });

    it('can load the Connect to hub page', () => {
      cy.on('uncaught:exception', () => {
        return false;
        // this is needed, otherwise it fails on some HTTP request
        // it seems that cy on duration is valid inside it, it does not catch api calls outisde
      });

      cy.login();
      // wait for the Connect to hub button to appear and then click on it
      cy.get('[data-ouia-component-id="Connect to Hub"]').click();

      // ensure the load token button appears
      cy.contains('button', 'Load token').should('exist');
    });
  });
});
