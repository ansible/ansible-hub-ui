describe('Remote Registry Tests', () => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');

  before(() => {
    cy.visit('/');
    cy.login(adminUsername, adminPassword);
    cy.deleteRegistries();
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
    cy.deleteRegistries();
  });
});
