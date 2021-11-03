describe('execution environments', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let num = (~~(Math.random() * 1000000)).toString();

  function deleteRegistries() {
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

  function deleteContainers() {
    cy.intercept(
      'GET',
      Cypress.env('prefix') + '_ui/v1/execution-environments/repositories/?*',
    ).as('listLoad');

    cy.visit('/ui/containers');

    cy.wait('@listLoad').then((result) => {
      var data = result.response.body.data;
      data.forEach((element) => {
        cy.get(
          'tr[aria-labelledby="' +
            element.name +
            '"] button[aria-label="Actions"]',
        ).click();
        cy.contains('a', 'Delete').click();
        cy.get('input[id=delete_confirm]').click();
        cy.contains('button', 'Delete').click();
        cy.wait('@listLoad', { timeout: 50000 });
        cy.get('.pf-c-alert__action').click();
      });
    });
  }

  before(() => {
    cy.login(adminUsername, adminPassword);
    deleteRegistries();
    deleteContainers();
    cy.addRemoteRegistry(`docker${num}`, 'https://registry.hub.docker.com/');
    cy.addRemoteContainer({
      name: `remotepine${num}`,
      upstream_name: 'library/alpine',
      registry: `docker${num}`,
      include_tags: 'latest',
    });
    cy.addLocalContainer(`localpine${num}`, 'alpine');
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('edits a remote container', () => {
    cy.contains('a', `remotepine${num}`).click();
    cy.get('.pf-c-button.pf-m-primary').contains('Edit').click();
    cy.get('#description').type('This is the description.');
    cy.contains('button', 'Save').click();
    cy.wait(10000); // FIXME have a reload request, wait for it; can't wait for an unspecified number of task requests
    cy.get('[data-cy=description]').should(
      'have.text',
      'This is the description.',
    );
  });

  it('edits a local container', () => {
    cy.contains('a', `localpine${num}`).click();
    cy.get('.pf-c-button.pf-m-primary').contains('Edit').click();
    cy.get('#description').type('This is the description.');
    cy.contains('button', 'Save').click();
    cy.wait(10000); // FIXME have a reload request, wait for it; can't wait for an unspecified number of task requests
    cy.get('[data-cy=description]').should(
      'have.text',
      'This is the description.',
    );
  });
});
