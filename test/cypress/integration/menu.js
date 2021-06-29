describe('Hub Menu Tests', () => {
    let baseUrl = Cypress.config().baseUrl;
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(baseUrl);
    });

    it('admin user sees complete menu', () => {
        cy.login(adminUsername, adminPassword);
        let menuItems = [ 'Collections', 'Namespaces', 'My Namespaces', 'API Token', 'Users', 'Groups', 'Approval', 'Repo Management' ];
        menuItems.forEach(item => cy.menuItem(item));
    });

    describe('', () => {
        let username = 'nopermission';
        let password = 'n0permissi0n';

        beforeEach(() => {
            cy.login(adminUsername, adminPassword);
            cy.createUser(username, password);
        });
        afterEach(() => {
            cy.deleteUser(username);
        });
        it('a user without permissions sees limited menu', () => {
            let menuItems = [ 'Collections', 'Namespaces', 'API Token', 'Repo Management' ];
            cy.logout();
            cy.login(username, password);
            menuItems.forEach(item => cy.menuItem(item));
        });
    });
});
