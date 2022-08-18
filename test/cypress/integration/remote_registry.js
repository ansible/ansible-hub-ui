describe('Remote Registry Tests', () => {
  before(() => {
    cy.visit('/');
    cy.login();
    cy.deleteRegistries();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  it('checks for empty state', () => {
    cy.menuGo('Execution Environments > Remote Registries');
    cy.get('.pf-c-empty-state__content > .pf-c-title').should(
      'have.text',
      'No remote registries yet',
    );
    cy.get('.pf-c-empty-state__content > .pf-c-empty-state__body').should(
      'have.text',
      'You currently have no remote registries.',
    );
  });

  it('admin can add new remote registry', () => {
    cy.menuGo('Execution Environments > Remote Registries');
    cy.addRemoteRegistry('New remote registry1', 'https://some url1');
    cy.addRemoteRegistry('New remote registry2', 'https://some url2', {
      username: 'some username2',
      password: 'some password2',
      proxy_url: 'https://some proxy_url2',
      proxy_username: 'some proxy_username2',
      proxy_password: 'some proxy_password2',
      download_concurrency: 5,
      rate_limit: 5,
    });
  });

  it('admin can view data', () => {
    cy.visit('/ui/registries');

    // table headers
    cy.contains('Remote Registries');
    [
      'Name',
      'Created',
      'Last updated',
      'Registry URL',
      'Registry sync status',
    ].forEach((element) => {
      cy.contains('tr[data-cy="SortTable-headers"]', element);
    });

    cy.contains('table tr', 'New remote registry1');
    cy.contains('table tr', 'New remote registry2');
    cy.contains('table tr', 'https://some url1');
    cy.contains('table tr', 'https://some url2');
  });

  it('user can sync succesfully remote registry', () => {
    cy.visit('/ui/registries');

    cy.intercept(
      'POST',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/*/sync',
    ).as('sync');

    cy.get(
      '[data-cy="ExecutionEnvironmentRegistryList-row-New remote registry1"]',
    )
      .contains('Sync from registry')
      .click();

    cy.wait('@sync');

    cy.get('[data-cy="AlertList"]').contains(
      'Sync started for remote registry "New remote registry1".',
    );

    cy.get(
      '[data-cy="ExecutionEnvironmentRegistryList-row-New remote registry1"]',
    ).contains('Completed', { timeout: 10000 });
  });

  it('admin can edit new remote registry', () => {
    cy.menuGo('Execution Environments > Remote Registries');

    cy.get(
      'tr[data-cy="ExecutionEnvironmentRegistryList-row-New remote registry1"] button[aria-label="Actions"]',
    ).click();
    cy.contains('a', 'Edit').click();

    cy.get('input[id = "url"]').clear();
    cy.get('input[id = "url"]').type('https://some new url2');

    //edit advanced options
    cy.contains('Show advanced options').click();

    cy.get('input[id="username"]').type('test');
    cy.get('input[id="password"]').type('test');
    cy.get('input[id="proxy_url"]').type('https://example.org');
    cy.get('input[id="proxy_username"]').type('test');
    cy.get('input[id="proxy_password"]').type('test');

    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
    ).as('registriesGet');

    cy.contains('button', 'Save').click();
    cy.wait('@registriesGet');

    // verify url change in list view
    cy.visit('/ui/registries');
    cy.contains('table tr', 'https://some new url2');

    // verify advanced option values have been saved properly.
    cy.get('[aria-label="Actions"]:first').click();
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('[data-cy="username"]').children().contains('Clear');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('[data-cy="proxy_username"]').children().contains('Clear');
    cy.contains('Save').click();
  });

  it('admin can delete data', () => {
    cy.deleteRegistries();
  });
});
