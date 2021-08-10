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

import shell from 'shell-escape-tag';
var urljoin = require('url-join');

Cypress.Commands.add('findnear', { prevSubject: true }, (subject, selector) => {
  return subject.closest(`*:has(${selector})`).find(selector);
});

Cypress.Commands.add('containsnear', {}, (...args) => {
  if (args.length >= 2) {
    if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      return cy.get(`*:has(${args[0]})`).contains(...args.slice(1));
    }
  }
  cy.log('constainsnear requires selector and content parameters');
});

Cypress.Commands.add('menuPresent', {}, (name) => {
  const last = name.split(' > ').pop();
  return cy.contains('#page-sidebar a', last).should('exist');
});

Cypress.Commands.add('menuMissing', {}, (name) => {
  const last = name.split(' > ').pop();
  return cy.contains('#page-sidebar a', last).should('not.exist');
});

Cypress.Commands.add('menuGo', {}, (name) => {
  const last = name.split(' > ').pop();
  return cy.contains('#page-sidebar a', last).click({ force: true });
});

let user_tokens = {};

Cypress.Commands.add('cookieReset', {}, () => {
  user_tokens = {};
});

Cypress.Commands.add('cookieLogin', {}, (username, password) => {
  if (!user_tokens[username]) {
    cy.login(username, password);
    cy.getCookies().then((cookies) => {
      let sessionid;
      let csrftoken;

      cookies.forEach((cookie) => {
        if (cookie.name == 'sessionid') {
          sessionid = cookie.value;
        }
        if (cookie.name == 'csrftoken') {
          csrftoken = cookie.value;
        }
      });

      user_tokens[username] = { sessionid, csrftoken };
    });
  } else {
    let csrftoken = user_tokens[username].csrftoken;
    let sessionid = user_tokens[username].sessionid;

    cy.setCookie('csrftoken', csrftoken);
    cy.setCookie('sessionid', sessionid);
    cy.visit('/');
  }
});

Cypress.Commands.add('logout', {}, () => {
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/me/').as('me');
  cy.get('[aria-label="user-dropdown"] button').click();
  cy.get('[aria-label="logout"]').click();
  cy.wait('@me');
});

Cypress.Commands.add('login', {}, (username, password) => {
  cy.intercept('POST', Cypress.env('prefix') + '_ui/v1/auth/login/').as(
    'login',
  );
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/me/').as('me');
  cy.visit('/ui/login');
  cy.get('#pf-login-username-id').type(username);
  cy.get('#pf-login-password-id').type(`${password}{enter}`);
  cy.wait('@login');
  cy.wait('@me');
});

Cypress.Commands.add(
  'createUser',
  {},
  (
    username,
    password = null,
    firstName = null,
    lastName = null,
    email = null,
  ) => {
    cy.menuGo('User Access > Users');

    const user = {
      firstName: firstName || 'First Name',
      lastName: lastName || 'Last Name',
      username: username,
      email: email || 'firstName@example.com',
      password: password || 'I am a complicated passw0rd',
    };
    cy.contains('Create').click();
    cy.get('#first_name').type(user.firstName);
    cy.get('#last_name').type(user.lastName);
    cy.get('#email').type(user.email);
    cy.get('#username').type(user.username);
    cy.get('#password').type(user.password);
    cy.get('#password-confirm').type(user.password);

    cy.intercept('POST', Cypress.env('prefix') + '_ui/v1/users/').as(
      'createUser',
    );

    cy.contains('Save').click();
    cy.wait('@createUser');

    // Wait for navigation
    cy.contains('.pf-c-title', 'Users');
  },
);

Cypress.Commands.add('createGroup', {}, (name) => {
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/groups/?*').as(
    'loadGroups',
  );
  cy.menuGo('User Access > Groups');
  cy.wait('@loadGroups');

  cy.contains('Create').click();

  cy.intercept('POST', Cypress.env('prefix') + '_ui/v1/groups/').as(
    'submitGroup',
  );
  cy.contains('div', 'Name *').findnear('input').first().type(`${name}{enter}`);
  cy.wait('@submitGroup');

  // Wait for the list to update
  cy.contains(name).should('exist');
});

/*
 * groupName: name of the group you want to add permissions to
 * permissions: array of {group, permissions}
 *   group: permission group, one of names from PERMISSIONS; namespaces | collections | users | groups | remotes | containers
 *   permissions: array of HUMAN_PERMISSIONS values (of the right group) - eg. "View user"
 */
Cypress.Commands.add('addPermissions', {}, (groupName, permissions) => {
  cy.intercept(
    'GET',
    Cypress.env('prefix') + '_ui/v1/groups/*/model-permissions/*',
  ).as('groups');
  cy.menuGo('User Access > Groups');
  cy.get(`[aria-labelledby=${groupName}] a`).click();
  cy.wait('@groups');
  cy.contains('button', 'Edit').click();
  permissions.forEach((permissionElement) => {
    permissionElement.permissions.forEach((permission) => {
      // closes previously open dropdowns
      cy.get('h1').click();
      cy.get(
        `.pf-l-flex.pf-m-align-items-center.${permissionElement.group} [aria-label="Options menu"]`,
      ).click();
      cy.contains('button', permission).click();
    });
  });
  // need to click outside dropdown to make save button clickable
  cy.contains('Edit group permissions').click();
  cy.contains('button', 'Save').click();
  // wait for for update
  cy.contains('button', 'Edit');
});

Cypress.Commands.add('removePermissions', {}, (groupName, permissions) => {
  cy.menuGo('User Access > Groups');
  cy.get(`[aria-labelledby=${groupName}] a`).click();
  cy.contains('button', 'Edit').click();
  permissions.forEach((permissionElement) => {
    if (permissionElement.permissions.length > 3) {
      // Make sure all permissions are visible
      cy.containsnear(
        `.pf-l-flex.pf-m-align-items-center.${permissionElement.group} `,
        'more',
      )
        .first()
        .click();
    }
    permissionElement.permissions.forEach((permission) => {
      cy.containsnear(
        `.pf-l-flex.pf-m-align-items-center.${permissionElement.group} `,
        permission,
      )
        .findnear('button')
        .first()
        .click();
    });
    // closes previously open dropdowns
    cy.get('h1').click();
  });
  cy.contains('button', 'Save').click();
  // wait for for update
  cy.contains('button', 'Edit');
});

const allPerms = [
  {
    group: 'namespaces',
    permissions: ['Add namespace', 'Change namespace', 'Upload to namespace'],
  },
  {
    group: 'collections',
    permissions: ['Modify Ansible repo content'],
  },
  {
    group: 'users',
    permissions: ['View user', 'Delete user', 'Add user', 'Change user'],
  },
  {
    group: 'groups',
    permissions: ['View group', 'Delete group', 'Add group', 'Change group'],
  },
  {
    group: 'remotes',
    permissions: ['Change collection remote', 'View collection remote'],
  },
  {
    group: 'containers',
    permissions: [
      // Turning off private container permissions since they aren't supported yet
      // 'Pull private containers', // container.namespace_pull_containerdistribution
      // 'View private containers', // container.namespace_view_containerdistribution

      'Change container namespace permissions',
      'Change containers',
      'Change image tags',
      'Create new containers',
      'Push to existing containers',
    ],
  },
];

Cypress.Commands.add('removeAllPermissions', {}, (groupName) => {
  cy.removePermissions(groupName, allPerms);
});

Cypress.Commands.add('addAllPermissions', {}, (groupName) => {
  cy.addPermissions(groupName, allPerms);
});

Cypress.Commands.add('addUserToGroup', {}, (groupName, userName) => {
  cy.menuGo('User Access > Groups');
  cy.get(`[aria-labelledby=${groupName}] a`).click();
  cy.contains('button', 'Users').click();
  cy.contains('button', 'Add').click();
  cy.get('input.pf-c-select__toggle-typeahead').type(userName);
  cy.contains('button', userName).click();
  cy.contains('footer > button', 'Add').click();
  cy.get(`[aria-labelledby=${userName}]`).should('exist');
});

Cypress.Commands.add('removeUserFromGroup', {}, (groupName, userName) => {
  cy.menuGo('User Access > Groups');
  cy.get(`[aria-labelledby=${groupName}] a`).click();
  cy.contains('button', 'Users').click();
  cy.get(`[aria-labelledby=${userName}] [aria-label=Actions]`).click();
  cy.containsnear(
    `[aria-labelledby=${userName}] [aria-label=Actions]`,
    'Remove',
  ).click();
  cy.contains('button.pf-m-danger', 'Delete').click();
  cy.contains(userName).should('not.exist');
});

// FIXME: createUser doesn't change logins, deleteUser does => TODO consistency
Cypress.Commands.add('deleteUser', {}, (username) => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  cy.logout();
  cy.login(adminUsername, adminPassword);

  cy.menuGo('User Access > Users');
  cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/users/**').as(
    'deleteUser',
  );
  cy.get(`[aria-labelledby=${username}] [aria-label=Actions]`).click();
  cy.containsnear(
    `[aria-labelledby=${username}] [aria-label=Actions]`,
    'Delete',
  ).click();

  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/users/?*').as('userList');

  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteUser').then(({ request, response }) => {
    expect(response.statusCode).to.eq(204);
  });

  // Wait for navigation
  cy.wait('@userList');
});

Cypress.Commands.add('deleteGroup', {}, (name) => {
  var adminUsername = Cypress.env('username');
  var adminPassword = Cypress.env('password');

  cy.logout();
  cy.login(adminUsername, adminPassword);

  cy.menuGo('User Access > Groups');
  cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/groups/**').as(
    'deleteGroup',
  );
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/groups/**').as(
    'listGroups',
  );
  cy.get(`[aria-labelledby=${name}] [aria-label=Delete]`).click();
  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteGroup').then(({ request, response }) => {
    expect(response.statusCode).to.eq(204);
  });

  // Wait for list reload
  cy.wait('@listGroups');
  cy.contains(name).should('not.exist');
});

// GalaxyKit Integration
/// cy.galaxykit(operation, ...args, options = {}) .. only args get escaped; yields an array of nonempty lines on success
Cypress.Commands.add('galaxykit', {}, (operation, ...args) => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');
  const server = Cypress.config().baseUrl + Cypress.env('prefix');
  const options =
    args.length >= 1 && typeof args[args.length - 1] == 'object'
      ? args.splice(args.length - 1, 1)[0]
      : [];
  const cmd = shell`galaxykit -s ${server} -u ${adminUsername} -p ${adminPassword} ${shell.preserve(
    operation,
  )} ${args}`;

  return cy.exec(cmd, options).then(({ code, stderr, stdout }) => {
    console.log(`RUN ${cmd}`, options, { code, stderr, stdout });

    if (stderr) {
      return Promise.reject(new Error(`Galaxykit failed: ${stderr}`));
    }

    return stdout.split('\n').filter((s) => !!s);
  });
});

const col1 = (line) => line.split(/\s+/)[0].trim();

Cypress.Commands.add('deleteTestUsers', {}, () => {
  cy.galaxykit('user list').then((lines) => {
    lines.map(col1).forEach((user) => cy.galaxykit('-i user delete', user));
  });
});

Cypress.Commands.add('deleteTestGroups', {}, () => {
  cy.galaxykit('group list').then((lines) => {
    lines.map(col1).forEach((group) => cy.galaxykit('-i group delete', group));
  });
});
