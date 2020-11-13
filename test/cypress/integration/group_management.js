describe('Hub Group Management Tests', () => {
    var host = Cypress.env("host");
    var adminUsername = Cypress.env("username");
    var adminPassword = Cypress.env("password");

    beforeEach(() => {
        cy.visit(host);
    });

    it('admin user can create and delete a group', () => {
        var name = 'testGroup';
        cy.login(adminUsername, adminPassword);
        cy.createGroup(name);
        cy.contains(name).should('exist');
        cy.deleteGroup(name);
        cy.contains(name).should('not.exist');
    });
});
