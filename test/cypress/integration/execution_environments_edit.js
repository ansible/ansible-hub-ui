describe('execution environments', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let num = (~~(Math.random() * 1000000)).toString();

  before(() => {
    cy.login(adminUsername, adminPassword);
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
