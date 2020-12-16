describe('Repo Management tests', () => {
    let host = Cypress.env('host');
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(host)
    });

    it('admin user sees download_concurrency in remote config', () => {
        cy.login(adminUsername, adminPassword);
        cy.visit(host + 'ui/repositories?page_size=10&tab=remote');
        cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
        cy.contains('Edit').click();
        cy.contains('Show advanced options').click();
        cy.get('#download_concurrency').should('exist');
    });
});
