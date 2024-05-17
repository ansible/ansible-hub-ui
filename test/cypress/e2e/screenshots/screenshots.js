const { range } = require('lodash');

const uiPrefix = Cypress.env('uiPrefix');

describe('screenshots', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();

    // insert test data
    cy.galaxykit('namespace create my_namespace');
    range(5).forEach((i) => {
      cy.galaxykit('collection upload my_namespace my_collection' + i);
    });
  });

  beforeEach(() => {
    cy.login();
  });

  after(() => {
    cy.deleteNamespacesAndCollections();
  });

  it('takes screenshots', () => {
    const screenshot = (path, options = {}) => {
      const filename = path.replaceAll('/', '__').replace(/^__$/, 'root');

      cy.visit(`${uiPrefix}${path}`.replace('//', '/'));
      cy.wait(3000);
      cy.screenshot(filename, options);
      cy.wait(1000);
    };

    screenshot('/');

    screenshot('/collections');
    screenshot('/namespaces');
    screenshot('/ansible/repositories', { blackout: ['time'] });
    screenshot('/ansible/remotes');
    screenshot('/token');
    screenshot('/approval-dashboard');
    screenshot('/my-imports');

    screenshot('/containers');
    screenshot('/registries');

    screenshot('/standalone/roles');
    screenshot('/standalone/namespaces');

    screenshot('/tasks', { blackout: ['time'] });
    screenshot('/signature-keys', {
      blackout: ['time', '[data-cy=hub-signature-list-fingerprint]'],
    });

    screenshot('/users', { blackout: ['time'] });
    screenshot('/group-list');
    screenshot('/roles', { blackout: ['time'] });

    screenshot('/settings/user-profile');
  });
});
