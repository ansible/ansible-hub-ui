const uiPrefix = Cypress.env('uiPrefix');

describe('screenshots', () => {
  before(() => {
    // insert test data
    cy.galaxykit('namespace create my_namespace');
    cy.galaxykit('-i collection upload my_namespace my_collection');
    cy.galaxykit('task wait all');
  });

  beforeEach(() => {
    cy.login();
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

    screenshot('/legacy/roles');
    screenshot('/legacy/namespaces');

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
