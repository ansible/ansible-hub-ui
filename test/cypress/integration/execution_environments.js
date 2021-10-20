describe('execution environments', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  before(() => {
    cy.login(adminUsername, adminPassword);
    cy.addRemoteRegistry('docker', 'https://registry.hub.docker.com/');
    cy.addRemoteContainer({
      name: 'alpine567',
      upstream_name: 'library/alpine',
      registry: 'docker',
      include_tags: 'latest',
    });
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('checks the EE list view', () => {
    pass;
  });
});
