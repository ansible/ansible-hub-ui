describe('Hub User Management Tests', () => {
    var host = Cypress.env('host');
    var adminUsername = Cypress.env('username');
    var adminPassword = Cypress.env('password');

    beforeEach(() => {
        cy.visit(host);

        cy.login(adminUsername, adminPassword);

        cy.contains('#page-sidebar a', 'Users').click();
    });

    it('User table lists users', () => {
        cy.contains('[aria-label="User list"] [aria-labelledby=admin]', 'admin');
    });

    describe('Creation and management of users', () => {
        var username = 'test';
        var password = 'p@ssword1';
        beforeEach(() => {
            cy.createUser(username, password, 'Test F', 'Test L', 'test@example.com');
            cy.contains('[aria-labelledby=test]', 'Test F');
        });

        afterEach(() => {
            cy.logout();
            cy.login(adminUsername, adminPassword);
            cy.deleteUser('test');
        });

        it('Can create new users', () => {
            cy.contains('[aria-labelledby=test]', 'Test F');
            cy.contains('[aria-labelledby=test]', 'Test L');
            cy.contains('[aria-labelledby=test]', 'test@example.com');

            cy.contains('.body', 'Test F').not();
        });
    });
});
