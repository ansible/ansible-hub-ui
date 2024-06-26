const uiPrefix = Cypress.env('uiPrefix');

describe('Container Signing', () => {
  function deleteAll() {
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteTestUsers();
  }

  before(() => {
    cy.login();
    deleteAll();

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

  after(() => {
    deleteAll();
  });

  it('can sign remote1', () => {
    cy.login();
    cy.visit(`${uiPrefix}containers/remote1`);
    cy.contains('[data-cy="column-section"]', 'remote1');
    cy.contains('.hub-header-bottom', 'Unsigned');

    cy.contains('Last updated from registry');

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('.pf-v5-c-dropdown ul li a', 'Sign').click();
    cy.contains('Signing started for container "remote1');
    cy.contains('.hub-header-bottom', 'Signed', {
      timeout: 30000,
    });
  });

  it('can not sign remote2', () => {
    cy.login();
    cy.visit(`${uiPrefix}containers/remote2`);
    cy.contains('[data-cy="column-section"]', 'remote2');
    cy.contains('.hub-header-bottom', 'Unsigned');

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('.pf-v5-c-dropdown ul li a', 'Sign').click();
    cy.contains('Container must be synchronized with remote repository first.');
  });

  it('can sign local', () => {
    cy.login();
    cy.visit(`${uiPrefix}containers/local1`);
    cy.contains('[data-cy="column-section"]', 'local1');
    cy.contains('.hub-header-bottom', 'Unsigned');

    cy.get('button[aria-label="Actions"]').click();
    cy.contains('.pf-v5-c-dropdown ul li a', 'Sign').click();
    cy.contains('Signing started for container "local1');
    cy.contains('.hub-header-bottom', 'Signed', {
      timeout: 30000,
    });
  });

  it.standalone('cant see sign button when user has no rights', () => {
    // user without sign privilleges
    const user = 'EESignTestUser';
    const password = 'MyPassword123';
    cy.galaxykit('-i user create', user, password);

    cy.login(user, password);
    cy.visit(`${uiPrefix}containers/local1`);
    // this is now covered by alert that should not be here in the future
    cy.get('button[aria-label="Actions"]').click({ force: true });
    cy.contains('[role=menu] li a', 'Use in Controller')
      .should('have.attr', 'href')
      .and('match', /^http.*\/execution-environments\/add.*local1%3Alatest$/);
    cy.contains('[role=menu] li', 'Sign').should('not.exist');
  });
});
