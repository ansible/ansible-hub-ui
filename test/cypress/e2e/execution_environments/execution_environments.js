describe('execution environments', () => {
  before(() => {
    cy.login();

    cy.deleteRegistries();
    cy.deleteContainers();

    cy.galaxykit('registry create', `registry`, 'https://quay.io/');
    cy.galaxykit(
      'container create',
      `remotepine`,
      'ansible/docker-test-containers',
      `registry`,
    );
  });

  beforeEach(() => {
    cy.login();
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('checks the EE list view', () => {
    cy.contains('a', `remotepine`);
    cy.contains('button', 'Add execution environment');
    cy.contains('button', 'Push container images');
    cy.contains('table th', 'Container repository name');
    cy.contains('table th', 'Description');
    cy.contains('table th', 'Created');
    cy.contains('table th', 'Last modified');
    cy.contains('table th', 'Container registry type');
  });

  it('checks the EE detail view', () => {
    cy.contains('a', `remotepine`).click();
    cy.get('.title-box').should('have.text', `remotepine`);
    cy.get('.pf-c-form-control').should(
      'have.value',
      `podman pull localhost:8002/remotepine`,
    );
  });

  it('adds a Readme', () => {
    cy.contains('a', `remotepine`).click();
    cy.get('[data-cy=add-readme]').click();
    cy.get('textarea').type('This is the readme file.');
    cy.get('[data-cy=save-readme]').click();
    cy.get('.markdown-editor').should(
      'have.text',
      'Raw MarkdownThis is the readme file.PreviewThis is the readme file.',
    );
  });
});
