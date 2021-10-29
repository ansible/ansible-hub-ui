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

  before(() => {
    cy.visit('/');
    cy.login(adminUsername, adminPassword);
    deleteData();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.login(adminUsername, adminPassword);
  });

  it('admin can add new remote registry', () => {
    cy.menuGo('Execution Enviroments > Remote Registries');
    cy.addRemoteRegistry('New remote registry1', 'some url1');
    cy.addRemoteRegistry('New remote registry2', 'some url2');
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
