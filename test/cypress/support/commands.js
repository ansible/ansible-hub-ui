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
    typeof args.at(-1) == 'object' &&
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
