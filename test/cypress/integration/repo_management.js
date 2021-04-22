describe('Repo Management tests', () => {
    let urljoin = require('url-join');
    let baseUrl = Cypress.config().baseUrl;
    let remoteRepoUrl = urljoin(baseUrl, 'ui/repositories?page_size=10&tab=remote');
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(baseUrl)
    });

    it('admin user sees download_concurrency in remote config', () => {
        cy.login(adminUsername, adminPassword);
        cy.visit(remoteRepoUrl);
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();
        cy.get('#download_concurrency').should('exist');
    });
    /* Needs more work to handle uploading a requirements.yml
     * when you want to save the remote proxy config.
     */
    it.skip('remote proxy config can be saved and deleted.', () => {
        cy.login(adminUsername, adminPassword);
        cy.visit(remoteRepoUrl);
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();

        // first fill it up with data
        cy.get('input[id="username"]').type('test');
        cy.get('input[id="password"]').type('test');
        cy.get('input[id="proxy_url"]').type('https://example.org');
        cy.get('input[id="proxy_username"]').type('test');
        cy.get('input[id="proxy_password"]').type('test');
        cy.route('PUT', Cypress.env('prefix') + 'content/community/v3/sync/config/').as('saveConfig');
        cy.contains('Save').click();
        cy.wait('@saveConfig').its('status').should('eq', 200);

        // verify values have been saved properly.
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();
        cy.get('input[id="username"]').should('have.value', 'test');
        cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
        cy.get('input[id="proxy_username"]').should('have.value', 'test');

        // clear the values
        cy.get('input[id="username"]').clear();
        cy.get('input[type="password"]').siblings('button').click({ multiple: true });
        cy.get('input[id="proxy_url"]').clear();
        cy.get('input[id="proxy_username"]').clear();
        cy.route('PUT', Cypress.env('prefix') + 'content/community/v3/sync/config/').as('saveConfig');
        cy.contains('Save').click();
        cy.wait('@saveConfig').its('status').should('eq', 200);

        // verify the values have been deleted
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();
        cy.get('input[id="username"]').should('have.value', '');
        cy.get('input[id="password"]').should('have.value', '');
        cy.get('input[id="proxy_url"]').should('have.value', '');
        cy.get('input[id="proxy_password"]').should('have.value', '');
    });
});
