describe('Hub User Management Tests', () => {
    let baseUrl = Cypress.config().baseUrl;
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');
    let username = 'test';
    let password = 'p@ssword1';

    before(() => {
        cy.deleteTestUsers();
        cy.deleteTestGroups();

        cy.visit(baseUrl);
        cy.login(adminUsername, adminPassword);

        cy.createUser(username, password, 'Test F', 'Test L', 'test@example.com');
        cy.contains('[aria-labelledby=test]', 'Test F');

        cy.createGroup('delete-user');
        cy.addPermissions('delete-user', [{group: 'users', permissions: ['View user', 'Delete user']}]);
        cy.addUserToGroup('delete-user', username);
        cy.logout();
    });

    describe('basic check of user page', () => {
        beforeEach(() => {
            cy.visit(baseUrl);
            cy.login(adminUsername, adminPassword);
            cy.menuGo('User Access > Users');
        });

        it('User table lists users', () => {
            cy.contains('[aria-label="User list"] [aria-labelledby=admin]', 'admin');
        });
    });

    describe('Creation and management of users', () => {
        beforeEach(() => {
            cy.visit(baseUrl);
            cy.login(adminUsername, adminPassword);
            cy.menuGo('User Access > Users');
        });

        afterEach(() => {
            cy.logout();
        });

        it('Can create new users', () => {
            cy.contains('[aria-labelledby=test]', 'Test F');
            cy.contains('[aria-labelledby=test]', 'Test L');
            cy.contains('[aria-labelledby=test]', 'test@example.com');

            cy.contains('.body', 'Test F').not();
        });
    });

    describe('prevents super-user and self deletion', () => {
        beforeEach(() => {
            cy.visit(baseUrl);
        });
        afterEach(() => {
            cy.logout();
        });

        function attemptToDelete(toDelete) {
            cy.menuGo('User Access > Users');
            cy.get(`[aria-labelledby=${toDelete}] [aria-label=Actions]`).click();
            cy.containsnear(`[aria-labelledby=${toDelete}] [aria-label=Actions]`, 'Delete').click();
            cy.get('footer > button:contains("Delete")').should('be.disabled');
            cy.get('footer > button:contains("Cancel")').click();
        }

        it('an ordinary user can\'t delete themselves', () => {
            cy.login(username, password);
            attemptToDelete(username);
        });
        it('an ordinary user can\'t delete the super-user', () => {
            cy.login(username, password);
            attemptToDelete(adminUsername);
        });

        it('the super-user can\'t delete themselves', () => {
            cy.login(adminUsername, adminPassword);
            attemptToDelete(adminUsername);
        });
    });

    after(() => {
        cy.login(adminUsername, adminPassword);
        cy.deleteUser(username);
        cy.deleteGroup('delete-user');
    });
});
