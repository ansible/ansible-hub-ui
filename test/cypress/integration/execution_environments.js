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
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('checks the EE list view', () => {
    cy.contains('a', `remotepine${num}`);
    cy.contains('button', 'Add execution environment');
    cy.contains('button', 'Push container images');
    cy.contains('table th', 'Container repository name');
    cy.contains('table th', 'Description');
    cy.contains('table th', 'Created');
    cy.contains('table th', 'Last modified');
    cy.contains('table th', 'Container registry type');
  });

  it('checks the EE detail view', () => {
    cy.contains('a', `remotepine${num}`).click();
    cy.get('.title-box').should('have.text', `remotepine${num}`);
    cy.get('.pf-c-form-control').should(
      'have.value',
      `podman pull localhost:8002/remotepine${num}:latest`,
    );
  });

  it('adds a Readme', () => {
    cy.contains('a', `remotepine${num}`).click();
    cy.get('[data-cy=add-readme]').click();
    cy.get('textarea').type('This is the readme file.');
    cy.get('[data-cy=save-readme]').click();
    cy.get('.markdown-editor').should(
      'have.text',
      'Raw MarkdownThis is the readme file.PreviewThis is the readme file.',
    );
  });
});
