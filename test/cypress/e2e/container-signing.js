describe('Container Signing', () => {
  function getContainerRowQuery(name) {
    return `[data-cy="ExecutionEnvironmentList-row-${name}"]  `;
  }

  function getContainerMenu(name) {
    return cy.get(getContainerRowQuery(name) + 'button[aria-label="Actions"]');
  }

  before(() => {
    cy.login();

    cy.deleteRegistries();
    cy.deleteContainers();

    cy.galaxykit(
      'registry create',
      `docker`,
      'https://registry.hub.docker.com/',
    );

    /*cy.galaxykit(
      'container create',
      `remote1`,
      'pulp/test-fixture-1',
      `docker`,
    );

    cy.galaxykit(
      'container create',
      `remote2`,
      'pulp/test-fixture-1',
      `docker`,
    );*/

    cy.addRemoteContainer({
      name: 'remote1',
      upstream_name: 'pulp/test-fixture-1',
      registry: 'docker',
      exclude_tags: '*-source',
    });
    cy.addRemoteContainer({
      name: 'remote2',
      upstream_name: 'pulp/test-fixture-1',
      registry: 'docker',
      exclude_tags: '*-source',
    });

    // prepare containers for signing - sync them
    cy.syncRemoteContainer('remote1');
    cy.syncRemoteContainer('remote2');
  });

  it('can sign remote in list', () => {
    cy.login();
    cy.visit('/ui/containers');
    cy.contains(getContainerRowQuery('remote1'), 'Unsigned', {
      timeout: 10000,
    });
    getContainerMenu('remote1').click();
    cy.contains('ul li a', 'Sign').click();
    cy.contains('Signing started for container "remote1');
    cy.contains(getContainerRowQuery('remote1'), 'Signed', { timeout: 30000 });
  });

  it('can sign remote in detail', () => {
    cy.login();
    cy.visit('/ui/containers/remote2');
    cy.contains('.column-section', 'remote2');
    cy.contains('.header-bottom', 'Unsigned', {
      timeout: 10000,
    });

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('ul li a', 'Sign').click();
    cy.contains('Signing started for container "remote2');
    cy.contains('.header-bottom', 'Signed', {
      timeout: 30000,
    });
  });
});
