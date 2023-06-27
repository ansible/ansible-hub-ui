const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

function deleteContainersManual() {
  cy.intercept(
    'GET',
    `${apiPrefix}v3/plugin/execution-environments/repositories/?*`,
  ).as('listLoad');

  cy.visit(`${uiPrefix}containers`);

  cy.wait('@listLoad').then((result) => {
    var data = result.response.body.data;
    data.forEach((element) => {
      cy.get(
        `tr[data-cy="ExecutionEnvironmentList-row-${element.name}"] button[aria-label="Actions"]`,
      ).click();
      cy.contains('a', 'Delete').click();
      cy.get('input[id=delete_confirm]').click();
      cy.contains('button', 'Delete').click();
      cy.wait('@listLoad', { timeout: 50000 });
      cy.get('.pf-c-alert__action').click();
    });
  });
}

describe('execution environments', () => {
  let num = (~~(Math.random() * 1000000)).toString();

  before(() => {
    cy.login();
    cy.deleteRegistriesManual();
    deleteContainersManual();

    cy.galaxykit(
      'registry create',
      `docker${num}`,
      'https://registry.hub.docker.com/',
    );
    cy.galaxykit(
      'container create',
      `remotepine${num}`,
      'library/alpine',
      `docker${num}`,
    );
    cy.addLocalContainer(`localpine${num}`, 'alpine');
  });

  beforeEach(() => {
    cy.login();
    cy.wait(10000);
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('edits a remote container', () => {
    cy.contains('a', `remotepine${num}`).click();
    cy.get('.pf-c-button.pf-m-secondary').contains('Edit').click();
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
    cy.get('.pf-c-button.pf-m-secondary').contains('Edit').click();
    cy.get('#description').type('This is the description.');
    cy.contains('button', 'Save').click();
    cy.wait(10000); // FIXME have a reload request, wait for it; can't wait for an unspecified number of task requests
    cy.get('[data-cy=description]').should(
      'have.text',
      'This is the description.',
    );
  });
});
