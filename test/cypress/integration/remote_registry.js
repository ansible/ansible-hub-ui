describe('Remote Registry Tests', () => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');

  function deleteData() {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
    ).as('registries');

    cy.visit('/ui/registries');

    cy.wait('@registries').then((result) => {
      var data = result.response.body.data;
      data.forEach((element) => {
        cy.get(
          'tr[aria-labelledby="' +
            element.name +
            '"] button[aria-label="Actions"]',
        ).click();
        cy.contains('a', 'Delete').click();
        cy.contains('button', 'Delete').click();
      });
    });
  }

  function addData(name, url, extra = null) {
    cy.contains('button', 'Add remote registry').click();

    // add registry
    cy.get('input[id = "name"]').type(name);
    cy.get('input[id = "url"]').type(url);
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

      cy.get('input[id = "username"]').type(username);
      cy.get('input[id = "password"]').type(password);
      //advanced options
      cy.get('.pf-c-expandable-section__toggle-text').click();
      cy.get('input[id = "proxy_url"]').type(proxy_url);
      cy.get('input[id = "proxy_username"]').type(proxy_username);
      cy.get('input[id = "proxy_password"]').type(proxy_password);
      cy.get('[data-cy=client_key]');
      cy.get('button[data-cy=client_cert]');
      cy.get('button[data-cy=ca_cert]');
      cy.get('input[id = "download_concurrency"]').type(download_concurrency);
      cy.get('input[id = "rate_limit"]').type(rate_limit);
    }
    cy.intercept(
      'POST',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/',
    ).as('registries');

    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
    ).as('registriesGet');

    cy.contains('button', 'Save').click();

    cy.wait('@registries');
    cy.wait('@registriesGet');
  }

  before(() => {
    cy.visit('/');
    cy.login(adminUsername, adminPassword);
    deleteData();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.login(adminUsername, adminPassword);
  });

  it('checks for empty state', () => {
    cy.menuGo('Execution Enviroments > Remote Registries');
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
    cy.menuGo('Execution Enviroments > Remote Registries');
    cy.addRemoteRegistry('New remote registry1', 'some url1');
    cy.addRemoteRegistry('New remote registry2', 'some url2', {
      username: 'some username2',
      password: 'some password2',
      proxy_url: 'some proxy_url2',
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
      cy.contains('tr[aria-labelledby="headers"]', element);
    });

    cy.contains('table tr', 'New remote registry1');
    cy.contains('table tr', 'New remote registry2');
    cy.contains('table tr', 'some url1');
    cy.contains('table tr', 'some url2');
  });

  it('admin can edit new remote registry', () => {
    cy.menuGo('Execution Enviroments > Remote Registries');

    cy.get(
      'tr[aria-labelledby="New remote registry1"] button[aria-label="Actions"]',
    ).click();
    cy.contains('a', 'Edit').click();

    cy.get('input[id = "url"]').clear();
    cy.get('input[id = "url"]').type('some new url2');

    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/registries/?*',
    ).as('registriesGet');

    cy.contains('button', 'Save').click();
    cy.wait('@registriesGet');

    cy.visit('/ui/registries');
    cy.contains('table tr', 'some new url2');
  });

  it('admin can delete data', () => {
    deleteData();
  });
});
