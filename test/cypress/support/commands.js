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

Cypress.Commands.add('createUser', {}, (username, password = null, firstName = null, lastName = null, email = null) => {
    cy.contains('#page-sidebar a', 'Users').click();

    const user = {
        firstName: firstName || 'First Name',
        lastName: lastName || 'Last Name',
        username: username,
        email: email || 'firstName@example.com',
        password: password || 'I am a complicated passw0rd',
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

Cypress.Commands.add('createGroup', {}, (name => {
    cy.contains('#page-sidebar a', 'Groups').click();

    cy.contains('Create').click();

    cy.contains('div', 'Name *').findnear('input').first().type(name);

    cy.server();
    cy.route('POST', Cypress.env('prefix') + '_ui/v1/groups/').as('createGroup');
    cy.contains('[role=dialog] button', 'Create').click();
    cy.wait('@createGroup');
});

Cypress.Commands.add('addPermissions', {}, (groupName, permissions) => {
    cy.contains('#page-sidebar a', 'Groups').click({'force': true});
    cy.get(`[aria-labelledby=${groupName}] a`).click({'force': true});
    cy.contains('button', 'Edit').click({'force': true});
    permissions.forEach(permissionElement => {
        cy.get(`.pf-l-flex.pf-m-align-items-center.${permissionElement.group} [aria-label="Options menu"]`).click({'force': true});
        permissionElement.permissions.forEach(permission => {
            cy.contains('button', permission).click({'force': true});
        })
    });
    cy.contains('button', 'Save').click({'force': true});
});

Cypress.Commands.add('removePermissions', {}, (groupName, permissions) => {
    cy.contains('#page-sidebar a', 'Groups').click({'force': true});
    cy.get(`[aria-labelledby=${groupName}] a`).click({'force': true});
    cy.contains('button', 'Edit').click({'force': true});
    permissions.forEach(permissionElement => {
        if (permissionElement.permissions.length > 3) {
            // Make sure all permissions are visible
            cy.containsnear(`.pf-l-flex.pf-m-align-items-center.${permissionElement.group} `, '1 more').first().click({'force': true});
        }
        permissionElement.permissions.forEach(permission => {
            cy.containsnear(`.pf-l-flex.pf-m-align-items-center.${permissionElement.group} `, permission).findnear('button').first().click({'force': true});
        });
    });
    cy.contains('button', 'Save').click({'force': true});
});

Cypress.Commands.add('addAllPermissions', {}, (groupName) => {
    var allPerms = [{
        group: 'namespaces', permissions: ['Add namespace', 'Change namespace', 'Upload to namespace']
    }, {
        group: 'collections', permissions: ['Modify Ansible repo content']
    },{
        group: 'users', permissions: ['View user', 'Delete user', 'Add user', 'Change user']
    },{
        group: 'groups', permissions: ['View group', 'Delete group', 'Add group', 'Change group']
    },{
        group: 'remotes', permissions: ['Change collection remote', 'View collection remote']
    }];
    cy.addPermissions(groupName, allPerms);
});

Cypress.Commands.add('addUserToGroup', {}, (groupName, userName) => {
    cy.contains('#page-sidebar a', 'Groups').click({'force': true});
    cy.get(`[aria-labelledby=${groupName}] a`).click({'force': true});
    cy.contains('button', 'Users').click({'force': true});
    cy.contains('button', 'Add').click({'force': true});
    cy.get('input.pf-c-select__toggle-typeahead').type(userName);
    cy.contains('button', userName).click({'force': true});
    cy.contains('footer > button', 'Add').click({'force': true});
    cy.get(`[aria-labelledby=${userName}]`).should('exist');
});

Cypress.Commands.add('removeUserFromGroup', {}, (groupName, userName) => {
    cy.contains('#page-sidebar a', 'Groups').click({'force': true});
    cy.get(`[aria-labelledby=${groupName}] a`).click({'force': true});
    cy.contains('button', 'Users').click({'force': true});
    cy.get(`[aria-labelledby=${userName}] [aria-label=Actions]`).click({'force': true});
    cy.containsnear(`[aria-labelledby=${userName}] [aria-label=Actions]`, 'Remove').click({'force': true});
    cy.contains(userName).should('not.exist');
});

Cypress.Commands.add('deleteUser', {}, (username) => {
    let adminUsername = Cypress.env('username');
    let adminPassword = Cypress.env('password');

    cy.logout();
    cy.login(adminUsername, adminPassword);

    cy.contains('#page-sidebar a', 'Users').click();
    cy.server();
    cy.route('DELETE', Cypress.env('prefix') + '_ui/v1/users/**').as('deleteUser');
    cy.get(`[aria-labelledby=${username}] [aria-label=Actions]`).click({'force': true});
    cy.containsnear(`[aria-labelledby=${username}] [aria-label=Actions]`, 'Delete').click({'force': true});
    cy.contains('[role=dialog] button', 'Delete').click({'force': true});
    cy.wait('@deleteUser');
    cy.get('@deleteUser').should('have.property', 'status', 204);
});

Cypress.Commands.add('deleteGroup', {}, (name) => {
    var adminUsername = Cypress.env('username');
    var adminPassword = Cypress.env('password');

    cy.logout();
    cy.login(adminUsername, adminPassword);

    cy.contains('#page-sidebar a', 'Groups').click();
    cy.server();
    cy.route('DELETE', Cypress.env('prefix') + '_ui/v1/groups/**').as('deleteGroup');
    cy.get(`[aria-labelledby=${name}] [aria-label=Delete]`).click({'force': true});
    cy.contains('[role=dialog] button', 'Delete').click({'force': true});
    cy.wait('@deleteGroup');
    cy.get('@deleteGroup').should('have.property', 'status', 204);
});
