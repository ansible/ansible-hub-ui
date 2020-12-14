describe('Hub Menu Tests', () => {
    let host = Cypress.env('host');
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(host)
    });

    it('admin user sees download_concurrency in remote config', () => {
       cy.login(adminUsername, adminPassword);
        cy.contains('#page-sidebar a', 'Repo Management').click();
        cy.get('div[class=tabs]>div>ul>li:last-child').click(); // click the 'remote' tab
        cy.get('tbody>tr>td>span:first').click(); // click the kebab menu on the 'community' repo
        cy.get('.pf-c-dropdown__menu-item').click(); // click on 'edit' in the dropdown
        cy.get('.pf-c-expandable-section__toggle-text').click(); // click 'advanced options' in the modal
        cy.get('#download_concurrency').should('exist');
    });
});
