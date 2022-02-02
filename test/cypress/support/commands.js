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
import { range } from 'lodash';

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

Cypress.Commands.add('apiLogin', {}, (username, password) => {
  let loginUrl = Cypress.env('prefix') + '_ui/v1/auth/login/';
  cy.request('GET', loginUrl).then(() => {
    cy.getCookie('csrftoken').then((csrftoken) => {
      cy.request({
        method: 'POST',
        url: loginUrl,
        body: { username, password },
        headers: { 'X-CSRFToken': csrftoken.value },
      });
    });
  });
  cy.visit('/');
});

Cypress.Commands.add('manualLogin', {}, (username, password) => {
  cy.intercept('POST', Cypress.env('prefix') + '_ui/v1/auth/login/').as(
    'login',
  );
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/feature-flags/').as(
    'feature-flags',
  );
  cy.visit('/ui/login');
  cy.get('#pf-login-username-id').type(username);
  cy.get('#pf-login-password-id').type(`${password}{enter}`);
  cy.wait('@login');
  cy.wait('@feature-flags');
});

Cypress.Commands.add('cookieLogout', {}, () => {
  cy.clearCookie('sessionid');
  cy.clearCookie('csrftoken');
  user_tokens = {};
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
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/feature-flags/').as(
    'feature-flags',
  );
  cy.get('[aria-label="user-dropdown"] button').click();
  cy.get('[aria-label="logout"]').click();
  cy.wait('@feature-flags');
});

Cypress.Commands.add('login', {}, (username, password) => {
  if (!username && !password) {
    // defult to admin
    username = Cypress.env('username');
    password = Cypress.env('password');
  }

  cy.apiLogin(username, password);
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
 *   group: permission group, one of names from PERMISSIONS; namespaces | collections | users | groups | remotes | containers | registries
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
    permissions: [
      'Add namespace',
      'Change namespace',
      'Delete namespace',
      'Upload to namespace',
    ],
  },
  {
    group: 'collections',
    permissions: ['Modify Ansible repo content', 'Delete collection'],
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
      'Delete container repository',
      'Change container namespace permissions',
      'Change containers',
      'Change image tags',
      'Create new containers',
      'Push to existing containers',
    ],
  },
  {
    group: 'registries',
    permissions: [
      'Add remote registry',
      'Change remote registry',
      'Delete remote registry',
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

Cypress.Commands.add('deleteUser', {}, (username) => {
  cy.menuGo('User Access > Users');
  cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/users/*').as(
    'deleteUser',
  );
  cy.get(`[aria-labelledby=${username}] [aria-label=Actions]`).click();
  cy.containsnear(
    `[aria-labelledby=${username}] [aria-label=Actions]`,
    'Delete',
  ).click();

  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/users/?*').as('userList');

  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteUser').then(({ response }) => {
    expect(response.statusCode).to.eq(204);
  });

  // Wait for navigation
  cy.wait('@userList');
  cy.contains(username).should('not.exist');
});

Cypress.Commands.add('deleteGroup', {}, (name) => {
  cy.menuGo('User Access > Groups');
  cy.intercept('DELETE', Cypress.env('prefix') + '_ui/v1/groups/*').as(
    'deleteGroup',
  );
  cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/groups/?*').as(
    'listGroups',
  );
  cy.get(`[aria-labelledby=${name}] [aria-label=Actions]`).click();
  cy.get('[aria-label=Delete]').click();
  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteGroup').then(({ response }) => {
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
  cy.log('galaxykit ' + operation + ' ' + args);
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

/// settings.py manipulation
Cypress.Commands.add('settings', {}, (newSettings) => {
  const settings = Cypress.env('settings'); // location for the settings.py file
  const restart = Cypress.env('restart'); // command to apply the settings

  const pythonifyValue = (v) =>
    v === true
      ? 'True'
      : v === false
      ? 'False'
      : v == null
      ? 'None'
      : JSON.stringify(v);
  const pythonify = (obj) =>
    obj
      ? Object.keys(obj).map((k) => `${k} = ${pythonifyValue(obj[k])} #CYPRESS`)
      : [];

  const newLines = pythonify(newSettings);
  console.log(`SETTINGS ${settings} ${newLines.join('\n')}`);

  return cy
    .readFile(settings)
    .then((data) => {
      const currentLines = data
        .split('\n')
        .filter((line) => !line.match('#CYPRESS'));
      return cy.writeFile(settings, [...currentLines, ...newLines].join('\n'));
    })
    .then(() => cy.exec(restart))
    .then(({ code, stderr, stdout }) => {
      console.log(`RUN ${restart} ${code} ${stdout} ${stderr}`);

      if (code) {
        return Promise.reject(new Error(`Restart failed (${code}): ${stderr}`));
      }
    })
    .then(() => cy.wait(2000))
    .then(() => {
      // wait for server to respond with a good status (502 means server didn't restart yet)
      // ..after waiting to make sure we're not faster than the restart
      cy.request({
        url: Cypress.env('prefix') + '_ui/v1/feature-flags/',
        retryOnStatusCodeFailure: true,
      })
        .its('status')
        .should('eq', 200);
    });
});

Cypress.Commands.add('addRemoteRegistry', {}, (name, url, extra = null) => {
  cy.menuGo('Execution Environments > Remote Registries');
  cy.contains('button', 'Add remote registry').click();

  // add registry
  cy.get('input[id="name"]').type(name);
  cy.get('input[id="url"]').type(url);

  if (extra) {
    const {
      username,
      password,
      proxy_url,
      proxy_username,
      proxy_password,
      download_concurrency,
      rate_limit,
    } = extra;

    cy.get('input[id="username"]').type(username);
    cy.get('input[id="password"]').type(password);
    //advanced options
    cy.get('.pf-c-expandable-section__toggle-text').click();
    cy.get('input[id="proxy_url"]').type(proxy_url);
    cy.get('input[id="proxy_username"]').type(proxy_username);
    cy.get('input[id="proxy_password"]').type(proxy_password);
    cy.get('[data-cy=client_key]');
    cy.get('button[data-cy=client_cert]');
    cy.get('button[data-cy=ca_cert]');
    cy.get('input[id="download_concurrency"]').type(download_concurrency);
    cy.get('input[id="rate_limit"]').type(rate_limit);
  }

  cy.intercept(
    'POST',
    Cypress.env('prefix') + '_ui/v1/execution-environments/registries/',
  ).as('registries');

  cy.intercept(
    'GET',
    Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
  ).as('registriesGet');

  cy.contains('button', 'Save').click();

  cy.wait('@registries');
  cy.wait('@registriesGet');
});

Cypress.Commands.add(
  'addRemoteContainer',
  {},
  ({ name, upstream_name, registry, include_tags }) => {
    cy.menuGo('Execution Environments > Execution Environments');
    cy.contains('button', 'Add execution environment').click();

    // add registry
    cy.get('input[id="name"]').type(name);
    cy.get('input[id="upstreamName"]').type(upstream_name);

    cy.get(
      '.hub-formgroup-registry .pf-c-form-control.pf-c-select__toggle-typeahead',
    )
      .click()
      .type(registry);
    cy.contains('button', registry).click();

    cy.get('input[id="addTagsInclude"]')
      .type(include_tags)
      .parent()
      .find('button', 'Add')
      .click();

    cy.intercept(
      'POST',
      Cypress.env('prefix') + '_ui/v1/execution-environments/remotes/',
    ).as('saved');

    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/repositories/?*',
    ).as('listLoad');

    cy.contains('button', 'Save').click();

    cy.wait('@saved');
    cy.wait('@listLoad');
  },
);

Cypress.Commands.add(
  'addLocalContainer',
  {},
  (localName, remoteName, registry = 'docker.io/') => {
    const log = ({ code, stderr, stdout }) =>
      console.log(`CODE=${code} ERR=${stderr} OUT=${stdout}`);
    const logFail = (...arr) => {
      console.log(arr);
      return Promise.reject(...arr);
    };
    const server = Cypress.env('containers');

    return cy
      .exec(shell`podman pull ${registry + remoteName}`)
      .then(log, logFail)
      .then(() =>
        cy.exec(
          shell`podman image tag ${remoteName} ${server}/${localName}:latest`,
        ),
      )
      .then(log, logFail)
      .then(() =>
        cy.exec(
          shell`podman login ${server} --tls-verify=false --username=admin --password=admin`,
          { failOnNonZeroExit: false },
        ),
      )
      .then(log, logFail)
      .then(() =>
        cy.exec(
          shell`podman push ${server}/${localName}:latest --tls-verify=false`,
          { failOnNonZeroExit: false },
        ),
      )
      .then(log, logFail);
  },
);

Cypress.Commands.add('syncRemoteContainer', {}, (name) => {
  cy.menuGo('Execution Environments > Execution Environments');
  cy.contains('tr', name)
    .find('button[aria-label="Actions"]')
    .click()
    .parents('tr')
    .contains('.pf-c-dropdown__menu-item', 'Sync from registry')
    .click();
  cy.contains('.pf-c-alert__title', `Sync initiated for ${name}`);
});

Cypress.Commands.add('deleteRegistries', {}, () => {
  cy.intercept(
    'GET',
    Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
  ).as('registries');

  cy.visit('/ui/registries');

  cy.wait('@registries').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.get(
        'tr[aria-labelledby="' +
          element.name +
          '"] button[aria-label="Actions"]',
      ).click();
      cy.contains('a', 'Delete').click();
      cy.contains('button', 'Delete').click();
      cy.wait('@registries');
    });
  });
});

Cypress.Commands.add('deleteContainers', {}, () => {
  cy.intercept(
    'GET',
    Cypress.env('prefix') + '_ui/v1/execution-environments/repositories/?*',
  ).as('listLoad');

  cy.visit('/ui/containers');

  cy.wait('@listLoad').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.get(
        'tr[aria-labelledby="' +
          element.name +
          '"] button[aria-label="Actions"]',
      ).click();
      cy.contains('a', 'Delete').click();
      cy.get('input[id=delete_confirm]').click();
      cy.contains('button', 'Delete').click();
      cy.wait('@listLoad', { timeout: 50000 });
      cy.get('.pf-c-alert__action').click();
    });
  });
});

Cypress.Commands.add('deleteCollections', {}, (namespace) => {
  range(5).forEach(() => {
    cy.galaxykit('namespace list-collections ' + namespace).then((json) => {
      JSON.parse(json).data.forEach((collection) => {
        cy.galaxykit('collection delete', namespace, collection.name);
      });
    });
  });
});

Cypress.Commands.add('deleteNamespacesAndCollections', {}, () => {
  cy.galaxykit('namespace list').then((json) => {
    JSON.parse(json).data.forEach((namespace) => {
      cy.deleteCollections(namespace.name);
      cy.galaxykit('namespace delete', namespace.name);
    });
  });
});

let database_saved = false;

Cypress.Commands.add('clearDatabase', {}, () => {
  if (database_saved) {
    // read snapshot
    cy.log('Restoring database from pg_dump.dump');
    let restore = Cypress.env('restore');
    restore =
      'podman exec pulp pg_restore -U postgres -d galaxy_ng -c pg_dump.dump;';
    cy.log(restore);
    cy.exec(restore);
  } else {
    // write snapshot
    database_saved = true;

    // logging the databases
    cy.log('logging the database');
    cy.exec("podman exec pulp psql -U postgres -c '\\l'").then((result) => {
      cy.log('result: ' + result.stdout);
      cy.log('error: ' + result.stderr);

      // yields the 'result' object
      // {
      //   code: 0,
      //   stdout: "Files successfully built",
      //   stderr: ""
      // }
    });

    cy.log('Dumping database to pg_dump.dump');
    let dump = Cypress.env('dump');
    dump =
      'podman exec pulp pg_dump -U postgres -d galaxy_ng -Fc > pg_dump.dump;';
    cy.log(dump);
    cy.exec(dump);

    let copy = 'podman cp pg_dump.dump pulp:pg_dump.dump;';
    cy.log(copy);
    cy.exec(copy);
  }
});
