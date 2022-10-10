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

  it('verify correctly assembled hidden_fields', () => {
    cy.intercept(
      'POST',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/',
    ).as('remoteRegistries');

    cy.addRemoteRegistry('foobar', 'https://whatever', {
      username: 'testuser',
      password: 'testpassword',
      proxy_url: 'https://whateverproxy',
      proxy_username: 'some proxy_username2',
      proxy_password: 'some proxy_password2',
      download_concurrency: 5,
      rate_limit: 5,
    });

    // test correct request with hidden fields
    cy.wait('@remoteRegistries').should((xhr) => {
      const reqBody = xhr.request.body;
      const resBody = xhr.response.body;

      // check data in request
      expect(reqBody.name).to.equal('foobar');
      expect(reqBody.username).to.equal('testuser');
      expect(reqBody.password).to.equal('testpassword');
      expect(reqBody.hidden_fields).to.be.undefined;

      // check data in response
      expect(resBody.name).to.equal('foobar');
      expect(resBody.username).not.to.exist;
      expect(resBody.password).not.to.exist;
      expect(resBody.hidden_fields).to.exist;

      // check for hidden_fields in response
      expect(resBody.hidden_fields).to.deep.equal([
        { name: 'username', is_set: true },
        { name: 'password', is_set: true },
        { name: 'client_key', is_set: false },
        { name: 'proxy_username', is_set: true },
        { name: 'proxy_password', is_set: true },
      ]);
    });
  });

  it('hidden_fields should be read_only', () => {
    cy.addRemoteRegistry('myremote', 'https://myurl', {
      username: 'mytestuser',
      password: 'mytestpassword',
      proxy_url: 'https://myproxy',
      proxy_username: 'myproxyusername',
      proxy_password: 'myproxypassword',
      download_concurrency: 5,
      rate_limit: 5,
    });

    cy.get(
      '[data-cy="kebab-toggle"]:first button[aria-label="Actions"]',
    ).click();
    cy.get('.pf-c-dropdown__menu-item').contains('Edit').click();

    cy.get('input[id="name"]').should('be.disabled');
    cy.get('input[id="name"]').should('have.value', 'myremote');
    cy.get('input[id="url"]').should('not.be.disabled');

    cy.get(
      '[data-cy="username"] > .pf-c-form__group-control > .pf-c-input-group > input',
    ).should('be.disabled');
    cy.get(
      '[data-cy="password"] > .pf-c-form__group-control > .pf-c-input-group > input',
    ).should('be.disabled');
    cy.get('.pf-c-expandable-section__toggle-text').click();
    cy.get(
      '[data-cy="proxy_username"] > .pf-c-form__group-control > .pf-c-input-group > input',
    ).should('be.disabled');
    cy.get(
      '[data-cy="proxy_password"] > .pf-c-form__group-control > .pf-c-input-group > input',
    ).should('be.disabled');
  });

  it('admin can delete data', () => {
    cy.deleteRegistries();
  });
});
