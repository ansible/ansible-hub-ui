// https://on.cypress.io/custom-commands
import { range } from 'lodash';
import shell from 'shell-escape-tag';

const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');
const insightsLogin = Cypress.env('insightsLogin');

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

    cy.intercept('POST', `${apiPrefix}_ui/v1/users/`).as('createUser');

    cy.contains('Save').click();
    cy.wait('@createUser');

    // Wait for navigation
    cy.contains('.pf-c-title', 'Users');
  },
);

Cypress.Commands.add('createGroupManually', {}, (name) => {
  cy.intercept('GET', `${apiPrefix}_ui/v1/groups/?*`).as('loadGroups');
  cy.menuGo('User Access > Groups');
  cy.wait('@loadGroups');

  cy.contains('Create').click();

  cy.intercept('POST', `${apiPrefix}_ui/v1/groups/`).as('submitGroup');
  cy.contains('div', 'Name *').findnear('input').first().type(`${name}{enter}`);
  cy.wait('@submitGroup');

  // Wait for the list to update
  cy.contains(name).should('exist');
});

Cypress.Commands.add('addUserToGroupManually', {}, (groupName, userName) => {
  cy.menuGo('User Access > Groups');
  cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
  cy.contains('button', 'Users').click();
  cy.contains('button', 'Add').click();
  cy.get('input.pf-c-select__toggle-typeahead').type(userName);
  cy.contains('button', userName).click();
  cy.get('.pf-c-content h2').click(); // click modal header to close dropdown
  cy.contains('footer > button', 'Add').click({ force: true });
  cy.get(`[data-cy="GroupDetail-users-${userName}"]`).should('exist');
});

Cypress.Commands.add(
  'removeUserFromGroupManually',
  {},
  (groupName, userName) => {
    cy.menuGo('User Access > Groups');
    cy.get(`[data-cy="GroupList-row-${groupName}"] a`).click();
    cy.contains('button', 'Users').click();
    cy.get(
      `[data-cy="GroupDetail-users-${userName}"] [aria-label="Actions"]`,
    ).click();
    cy.containsnear(
      `[data-cy="GroupDetail-users-${userName}"] [aria-label="Actions"]`,
      'Remove',
    ).click();
    cy.contains('button.pf-m-danger', 'Delete').click();
    cy.contains('[data-cy=main-tabs]', userName).should('not.exist');
  },
);

Cypress.Commands.add('deleteUser', {}, (username) => {
  cy.menuGo('User Access > Users');
  cy.intercept('DELETE', `${apiPrefix}_ui/v1/users/*`).as('deleteUser');
  cy.get(`[data-cy="UserList-row-${username}"] [aria-label="Actions"]`).click();
  cy.containsnear(
    `[data-cy="UserList-row-${username}"] [aria-label="Actions"]`,
    'Delete',
  ).click();

  cy.intercept('GET', `${apiPrefix}_ui/v1/users/?*`).as('userList');

  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteUser').then(({ response }) => {
    expect(response.statusCode).to.eq(204);
  });

  // Wait for navigation
  cy.wait('@userList');
  cy.get('h4[class=pf-c-alert__title]').should(
    'have.text',
    'Success alert:User "testUser" has been successfully deleted.',
  );
});

Cypress.Commands.add('deleteGroupManually', {}, (name) => {
  cy.menuGo('User Access > Groups');
  cy.intercept('DELETE', `${apiPrefix}_ui/v1/groups/*`).as('deleteGroup');
  cy.intercept('GET', `${apiPrefix}_ui/v1/groups/?*`).as('listGroups');
  cy.get(`[data-cy="GroupList-row-${name}"] [aria-label="Actions"]`).click();
  cy.get('[aria-label=Delete]').click();
  cy.contains('[role=dialog] button', 'Delete').click();
  cy.wait('@deleteGroup').then(({ response }) => {
    expect(response.statusCode).to.eq(204);
  });

  // Wait for list reload
  cy.wait('@listGroups');
  cy.contains('No groups yet').should('exist');
});

// GalaxyKit Integration
/// cy.galaxykit(operation, ...args, options = {}) .. only args get escaped; yields an array of nonempty lines on success
Cypress.Commands.add('galaxykit', {}, (operation, ...args) => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');
  const galaxykitCommand = Cypress.env('galaxykit') || 'galaxykit';
  const server = Cypress.config().baseUrl + apiPrefix;
  const options = (args.length >= 1 &&
    typeof args[args.length - 1] == 'object' &&
    args.splice(args.length - 1, 1)[0]) || { failOnNonZeroExit: false };

  cy.log(`${galaxykitCommand} ${operation} ${args}`);
  const cmd = shell`${shell.preserve(
    galaxykitCommand,
  )} -s ${server} -u ${adminUsername} -p ${adminPassword} ${shell.preserve(
    operation,
  )} ${args}`;

  return cy.exec(cmd, options).then(({ code, stderr, stdout }) => {
    console.log(`RUN ${cmd}`, options, { code, stderr, stdout });

    if (code || stderr) {
      cy.log('galaxykit code: ' + code);
      cy.log('galaxykit stderr: ' + stderr);
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
  range(4).forEach(() => {
    cy.galaxykit('group list').then((lines) => {
      lines
        .map(col1)
        .forEach((group) => cy.galaxykit('-i group delete', group));
    });
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
    `${apiPrefix}_ui/v1/execution-environments/registries/`,
  ).as('registries');

  cy.intercept(
    'GET',
    `${apiPrefix}_ui/v1/execution-environments/registries/?*`,
  ).as('registriesGet');

  cy.contains('button', 'Save').click();

  cy.wait('@registries');
  cy.wait('@registriesGet');
});

Cypress.Commands.add(
  'addRemoteContainer',
  {},
  ({ name, upstream_name, registry, include_tags, exclude_tags }) => {
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

    if (include_tags) {
      cy.get('input[id="addTagsInclude"]')
        .type(include_tags)
        .parent()
        .find('button', 'Add')
        .click();
    }

    if (exclude_tags) {
      cy.get('input[id="addTagsExclude"]')
        .type(exclude_tags)
        .parent()
        .find('button', 'Add')
        .click();
    }

    cy.intercept(
      'POST',
      `${apiPrefix}_ui/v1/execution-environments/remotes/`,
    ).as('saved');

    cy.intercept(
      'GET',
      `${apiPrefix}v3/plugin/execution-environments/repositories/?*`,
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
  cy.contains(
    '.pf-c-alert__title',
    `Sync started for execution environment "${name}".`,
  );
  // wait for finish
  cy.contains('a', 'detail page').click();
  cy.contains('.title-box h1', 'Completed', { timeout: 30000 });
});

Cypress.Commands.add('deleteRegistriesManual', {}, () => {
  cy.intercept(
    'GET',
    `${apiPrefix}_ui/v1/execution-environments/registries/?*`,
  ).as('registries');

  cy.visit(`${uiPrefix}registries`);

  cy.wait('@registries').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.get(
        `tr[data-cy="ExecutionEnvironmentRegistryList-row-${element.name}"] button[aria-label="Actions"]`,
      ).click();
      cy.contains('a', 'Delete').click();
      cy.contains('button', 'Delete').click();
      cy.wait('@registries');
    });
  });
});

Cypress.Commands.add('deleteRegistries', {}, () => {
  cy.intercept(
    'GET',
    `${apiPrefix}_ui/v1/execution-environments/registries/?*`,
  ).as('registries');

  cy.visit(`${uiPrefix}registries?page_size=100`);

  cy.wait('@registries').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.galaxykit('registry delete', element.name);
    });
  });
});

Cypress.Commands.add('deleteContainers', {}, () => {
  cy.intercept(
    'GET',
    `${apiPrefix}v3/plugin/execution-environments/repositories/?*`,
  ).as('listLoad');

  cy.visit(`${uiPrefix}containers?page_size=100`);

  cy.wait('@listLoad').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.galaxykit('container delete', element.name);
    });
  });
});

Cypress.Commands.add('deleteContainersManual', {}, () => {
  cy.intercept(
    'GET',
    `${apiPrefix}v3/plugin/execution-environments/repositories/?*`,
  ).as('listLoad');

  cy.visit(`${uiPrefix}containers`);

  cy.wait('@listLoad').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.get(
        `tr[data-cy="ExecutionEnvironmentList-row-${element.name}"] button[aria-label="Actions"]`,
      ).click();
      cy.contains('a', 'Delete').click();
      cy.get('input[id=delete_confirm]').click();
      cy.contains('button', 'Delete').click();
      cy.wait('@listLoad', { timeout: 50000 });
      cy.get('.pf-c-alert__action').click();
    });
  });
});

Cypress.Commands.add('goToNamespaces', {}, () => {
  if (insightsLogin) {
    cy.visit(`${uiPrefix}partners`);
  } else {
    cy.menuGo('Collections > Namespaces');
  }
});

Cypress.Commands.add(
  'createApprovedCollection',
  {},
  (namespace, collection) => {
    cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    if (insightsLogin) {
      cy.galaxykit(`-i collection move ${namespace} ${collection}`);
    }
  },
);

Cypress.Commands.add('deleteAllCollections', {}, () => {
  const waitForEmptyCollection = (maxLoops) => {
    if (maxLoops == 0) {
      cy.log('Max loops reached while waiting for the empty collections.');
      return;
    }

    cy.wait(3000);

    cy.galaxykit('collection list').then((res) => {
      const data = JSON.parse(res[0]).data;
      if (data.length != 0) {
        waitForEmptyCollection(maxLoops - 1);
      } else {
        cy.log('Collections are empty!');
      }
    });
  };

  cy.galaxykit('collection list').then((res) => {
    const data = JSON.parse(res[0]).data;
    cy.log(data.length + ' collections found for deletion.');
    data.forEach((record) => {
      cy.galaxykit(
        'collection delete',
        record.namespace,
        record.name,
        record.version,
        record.repository_list[0],
      );
    });
  });

  waitForEmptyCollection(10);
});

Cypress.Commands.add('deleteNamespacesAndCollections', {}, () => {
  cy.deleteAllCollections();

  range(4).forEach(() => {
    cy.galaxykit('namespace list').then((json) => {
      JSON.parse(json).data.forEach((namespace) => {
        cy.galaxykit('namespace delete', namespace.name);
      });
    });
  });
});

Cypress.Commands.add(
  'createRole',
  {},
  (name, description, permissions = [], ignoreError = false) => {
    cy.galaxykit(
      `${ignoreError ? '-i' : ''} role create`,
      name,
      description,
      `--permissions=${permissions.join(',')}`,
    );
  },
);

Cypress.Commands.add('deleteRole', {}, (role) => {
  cy.visit(`${uiPrefix}roles/`);

  cy.get(
    `[data-cy="RoleListTable-ExpandableRow-row-${role}"] [data-cy=kebab-toggle]`,
  ).click();

  cy.contains('Delete').click();
  cy.get('[data-cy=DeleteModal]')
    .parent()
    .get('button')
    .contains('Delete')
    .click();
});
