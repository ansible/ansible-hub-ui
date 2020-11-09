describe('Hub Menu Tests', () => {
    var host = Cypress.env("host");
    var adminUsername = Cypress.env("username");
    var adminPassword = Cypress.env("password");

    beforeEach(() => {
        cy.visit(host);
    })

    it('admin user sees complete menu', () => {
        cy.login(adminUsername, adminPassword);
        var menuItems = [ 'Collections', 'Namespaces', 'My Namespaces', 'API Token', 'Users', 'Groups', 'Approval', 'Repo Management' ];
        menuItems.forEach(item => cy.menuItem(item));
    });

    it('a user without permissions sees limited menu', () => {
        var menuItems = [ 'Collections', 'Namespaces', 'API Token', 'Repo Management' ];
        cy.login(adminUsername, adminPassword);
        var username = 'nopermission';
        var password = 'n0permissi0n';
        cy.createUser(username, password);
        cy.logout();
        cy.login(username, password);
        menuItems.forEach(item => cy.menuItem(item));
        cy.deleteUser(username);
    });
})
