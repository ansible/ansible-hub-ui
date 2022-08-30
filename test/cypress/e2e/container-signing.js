describe('Container Signing', () => {
  const user = 'EESignTestUser';
  const password = 'MyPassword123';
  const group = 'EESignTestGroup';

  function deleteAll() {
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteTestUsers();
    cy.deleteTestGroups();
  }

  before(() => {
    cy.login();
    deleteAll();

    // user without sign privilleges
    cy.galaxykit('-i user create', user, password);
    cy.galaxykit('-i group create', group);
    cy.galaxykit('-i user group add', user, group);
    cy.galaxykit('-i group role add', group, 'galaxy.');

    cy.galaxykit(
      'registry create',
      `docker`,
      'https://registry.hub.docker.com/',
    );

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

    cy.addLocalContainer('local1', 'pulp/test-fixture-1:manifest_a');

    // prepare containers for signing - sync them
    cy.syncRemoteContainer('remote1');
    // remote 2 is not synced intentionaly - we need test that throws error
  });

  after(() => {});

  it('can sign remote1', () => {
    cy.login();
    cy.visit('/ui/containers/remote1');
    cy.contains('.column-section', 'remote1');
    cy.contains('.header-bottom', 'Unsigned', {
      timeout: 10000,
    });

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('ul li a', 'Sign').click();
    cy.contains('Signing started for container "remote1');
    cy.contains('.header-bottom', 'Signed', {
      timeout: 30000,
    });
  });

  it('can not sign remote2', () => {
    cy.login();
    cy.visit('/ui/containers/remote2');
    cy.contains('.column-section', 'remote2');
    cy.contains('.header-bottom', 'Unsigned', {
      timeout: 10000,
    });

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('ul li a', 'Sign').click();
    cy.contains('Container must be synchronized with remote repository first.');
  });

  it('can sign local', () => {
    cy.login();
    cy.visit('/ui/containers/local1');
    cy.contains('.column-section', 'local1');
    cy.contains('.header-bottom', 'Unsigned', {
      timeout: 10000,
    });

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('ul li a', 'Sign').click();
    cy.contains('Signing started for container "local1');
    cy.contains('.header-bottom', 'Signed', {
      timeout: 30000,
    });
  });

  /*it('cant see sign button when user has no rights', () => {
    cy.login(user, password);
    cy.visit('/ui/containers/local1');
    cy.get('button[aria-label="Actions"]').click();

  });*/
});
