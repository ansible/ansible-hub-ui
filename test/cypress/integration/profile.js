describe('My Profile Tests', () => {
    var baseUrl = Cypress.env('baseUrl');
    var adminUsername = Cypress.env('username');
    var adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(baseUrl);
        cy.login(adminUsername, adminPassword);
        // open the dropdown labeled with the username and then...
        cy.get('[aria-label="user-dropdown"] button').click();
        // a little hacky, but basically
        // just click the one link that says 'My profile'.
        cy.get('a').contains('My profile').click(); 
    });

    it('only has input fields for name, email, username, password and pass confirmation', () => {
        let inputs = ['first_name', 'last_name', 'email', 'username', 'password', 'password-confirm'];
        cy.get('.body').within(() => {
            cy.get('input').each(($el, index, $list) => {
                expect(inputs).to.include($el.attr('id'));
            });
        });
    });
});
