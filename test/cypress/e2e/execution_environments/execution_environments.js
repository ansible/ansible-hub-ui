describe('execution environments', () => {
  const num = (~~(Math.random() * 1000000)).toString();

  before(() => {
    cy.login();

    cy.deleteRegistries();
    cy.deleteContainers();

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
  });

  beforeEach(() => {
    cy.login();
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('checks the EE list view', () => {
    cy.contains('a', `remotepine${num}`);
    cy.contains('button', 'Add execution environment');
    cy.contains('a[target=_blank]', 'Push container images');
    cy.contains('table th', 'Container repository name');
    cy.contains('table th', 'Description');
    cy.contains('table th', 'Created');
    cy.contains('table th', 'Last modified');
    cy.contains('table th', 'Container registry type');
  });

  it('checks the EE detail view', () => {
    const url =
      Cypress.config().baseUrl.contains('https') &&
      Cypress.config().baseUrl.replace(/[`https` : /]/g, '');
    cy.contains('a', `remotepine${num}`).click();
    cy.get('.title-box').should('have.text', `remotepine${num}`);
    cy.get('.pf-c-form-control').should(
      'have.value',
      `podman pull ${url}/remotepine${num}`,
    );
  });

  it('adds a Readme', () => {
    cy.contains('a', `remotepine${num}`).click();
    cy.get('[data-cy=add-readme]').click();
    cy.get('textarea').type('{del}This is the readme file.', { delay: 500 });
    cy.get('[data-cy=save-readme]').click();
    cy.get('.markdown-editor').should(
      'have.text',
      'Raw MarkdownThis is the readme file.PreviewThis is the readme file.',
    );
  });
});
