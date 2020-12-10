// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('findnear', {prevSubject: true}, (subject, selector) => {
    return subject.closest(`*:has(${selector})`).find(selector);
});

Cypress.Commands.add('containsnear', {}, (...args) => {
    if (args.length >= 2) {
        if (typeof(args[0]) === 'string' && typeof(args[1]) === 'string') {
            return cy.get(`*:has(${args[0]})`).contains(...args.slice(1));
        }
    }
    cy.log('constainsnear requires selector and content parameters');
});

Cypress.Commands.add('menuItem', {}, (name) => {
    return cy.contains('#page-sidebar a', name);
});

Cypress.Commands.add('logout', {}, () => {
    cy.server();
    cy.route('GET', Cypress.env('prefix') + '_ui/v1/me/').as('me');
    cy.get('[aria-label="user-dropdown"] button').click();
    cy.get('[aria-label="logout"]').click();
    cy.wait('@me');
});

Cypress.Commands.add('login', {}, (username, password) => {
    cy.server();
    cy.route('POST', Cypress.env('prefix') + '_ui/v1/auth/login/').as('login');
    cy.route('GET', Cypress.env('prefix') + '_ui/v1/me/').as('me');
    cy.get('#pf-login-username-id').type(username);
    cy.get('#pf-login-password-id').type(`${password}{enter}`);
    cy.wait('@login');
    cy.wait('@me');
});

Cypress.Commands.add('createUser', {}, (username, password, firstName = null, lastName = null, email = null) => {
    cy.contains('#page-sidebar a', 'Users').click();

    const user = {
        firstName: firstName || 'First Name',
        lastName: lastName || 'Last Name',
        username: username,
        email: email || 'firstName@example.com',
        password: password,
    };
    cy.contains('Create user').click();
    cy.get('#first_name').type(user.firstName);
    cy.get('#last_name').type(user.lastName);
    cy.get('#email').type(user.email);
    cy.get('#username').type(user.username);
    cy.get('#password').type(user.password);
    cy.get('#password-confirm').type(user.password);

    cy.contains('Save').click();
});

Cypress.Commands.add('deleteUser', {}, (username) => {
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    cy.logout();
    cy.login(adminUsername, adminPassword);

    cy.contains('#page-sidebar a', 'Users').click();

    cy.get(`[aria-labelledby=${username}] [aria-label=Actions]`).click();
    cy.containsnear(`[aria-labelledby=${username}] [aria-label=Actions]`, 'Delete').click();
    cy.contains('[role=dialog] button', 'Delete').click();
});
