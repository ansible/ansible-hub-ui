// https://on.cypress.io/custom-commands
import { range } from 'lodash';
import shell from 'shell-escape-tag';

const apiPrefix = Cypress.env('apiPrefix');
const pulpPrefix = `${apiPrefix}pulp/api/v3/`;
const uiPrefix = Cypress.env('uiPrefix');

Cypress.Commands.add('containsnear', {}, (...args) => {
  if (args.length >= 2) {
    if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      return cy.get(`*:has(${args[0]})`).contains(...args.slice(1));
    }
  }
  cy.log('constainsnear requires selector and content parameters');
});

const name2element = (name) => {
  const [first, last] = name.split(' > ');
  return last
    ? cy.get(
        `#page-sidebar [data-cy="hub-menu-section-${first}"] [data-cy="hub-menu-item-${last}"]`,
      )
    : cy.get(`#page-sidebar [data-cy="hub-menu-item-${first}"]`);
};

Cypress.Commands.add('menuPresent', {}, (name) => {
  return name2element(name).should('exist');
});

Cypress.Commands.add('menuMissing', {}, (name) => {
  return name2element(name).should('not.exist');
});

Cypress.Commands.add('menuGo', {}, (name) => {
  return name2element(name).click({ force: true });
});

Cypress.Commands.add('assertTitle', {}, (title) => {
  cy.contains('.pf-v5-c-title', title);
});

Cypress.Commands.add('openHeaderKebab', {}, () => {
  cy.wait(500); // the collection detaill displays the kebab before all apis are loaded, repaints after.. just wait
  cy.scrollTo(0, 0, { ensureScrollable: false });
  cy.get('[data-cy="kebab-toggle"] [aria-label="Actions"]').click();
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
      username,
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
    cy.assertTitle('Users');
  },
);

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
    console.log(`RUN ${cmd}`);

    if (code) {
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
    cy.get('.pf-v5-c-expandable-section__toggle-text').click();
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
      '.hub-formgroup-registry .pf-v5-c-form-control.pf-v5-c-select__toggle-typeahead',
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
    .contains('.pf-v5-c-dropdown__menu-item', 'Sync from registry')
    .click();
  cy.contains(
    '.pf-v5-c-alert__title',
    `Sync started for execution environment "${name}".`,
  );
  // wait for finish
  cy.contains('a', 'detail page').click();
  cy.contains('[data-cy="title-box"] h1', 'Completed', { timeout: 30000 });
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

Cypress.Commands.add('deleteRepositories', {}, () => {
  const initRepos = [
    'validated',
    'rh-certified',
    'community',
    'published',
    'rejected',
    'staging',
  ];

  cy.login();
  cy.intercept('GET', `${pulpPrefix}repositories/ansible/ansible/?*`).as(
    'data',
  );

  cy.visit(`${uiPrefix}ansible/repositories/?page_size=100`);
  cy.wait('@data').then((res) => {
    res.response.body.results.forEach((res) => {
      if (!initRepos.includes(res.name)) {
        cy.galaxykit('-i distribution delete ', res.name);
        cy.galaxykit('-i repository delete ', res.name);
      }
    });
  });
});

Cypress.Commands.add('deleteAllCollections', {}, () => {
  cy.galaxykit('collection list').then((res) => {
    const data = JSON.parse(res[0]).data;
    cy.log(data.length + ' collections found for deletion.');
    data.forEach((record) => {
      if (record.repository_list.length > 0) {
        // do not delete orphan collection, it will fail
        cy.galaxykit(
          'collection delete',
          record.namespace,
          record.name,
          record.version,
          record.repository_list[0],
        );
      }
    });
  });

  cy.galaxykit('task wait all');
});

Cypress.Commands.add('deleteNamespacesAndCollections', {}, () => {
  cy.deleteAllCollections();

  let deleteNamespaces = true;
  cy.galaxykit('collection list').then((res) => {
    const data = JSON.parse(res[0]).data;
    data.forEach((record) => {
      if (record.repository_list.length == 0) {
        deleteNamespaces = false;
      }
    });
  });

  // if orphan collection found, do not delete namespaces, otherwise it will fail
  if (deleteNamespaces) {
    cy.galaxykit('namespace list').then((json) => {
      JSON.parse(json).data.forEach((namespace) => {
        cy.galaxykit('namespace delete', namespace.name);
      });
    });
    cy.galaxykit('task wait all');
  }
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
