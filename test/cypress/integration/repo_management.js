describe('Repo Management tests', () => {
    let host = Cypress.env('host');
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(host)
    });

    it('admin user sees download_concurrency in remote config', () => {
        let urljoin = require('url-join');
        let fullUrl = (host + '/ui/repositories?page_size=10&tab=remote')
        cy.login(adminUsername, adminPassword);
        cy.visit(fullUrl);
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();
        cy.get('#download_concurrency').should('exist');
    });
    it('remote proxy config can be saved and deleted.', () => {
        cy.login(adminUsername, adminPassword);
        cy.visit(host + 'ui/repositories?page_size=10&tab=remote');
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
