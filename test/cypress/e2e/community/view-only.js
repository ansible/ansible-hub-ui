const uiPrefix = Cypress.env('uiPrefix');

describe('view-only mode - with download', () => {
  before(() => {
    cy.galaxykit('collection upload');
  });

  it('has limited menu, nav', () => {
    cy.visit(uiPrefix);

    ['Collections > Collections', 'Collections > Namespaces'].forEach((item) =>
      cy.menuPresent(item),
    );

    [
      'Collections > Repositories',
      'Collections > Remotes',
      'Collections > API token',
      'Collections > Approval',
      'Execution Environments > Execution Environments',
      'Execution Environments > Remote Registries',
      'Task Management',
      'Signature Keys',
      'User Access > Users',
      'User Access > Groups',
      'User Access > Roles',
    ].forEach((item) => cy.menuMissing(item));

    // login button in top right nav
    cy.contains('.pf-v5-c-masthead__content', 'Login');
  });

  it('can load Dashboard & Collections', () => {
    cy.visit(uiPrefix);
    cy.assertTitle('Welcome to Galaxy');

    cy.visit(`${uiPrefix}collections`);
    cy.assertTitle('Collections');

    // go to a detail screen
    cy.get('.pf-v5-c-card__header .name a').first().click();

    cy.contains('.pf-v5-c-button', 'Download tarball');
  });

  it('can load Namespaces', () => {
    cy.visit(`${uiPrefix}namespaces`);
    cy.assertTitle('Namespaces');

    cy.contains('button', 'Create').should('not.exist');
    cy.contains('.pf-v5-c-tabs__item a', 'My namespaces').should('not.exist');

    // go to a (namespace) detail screen
    cy.contains('a', 'View collections').click();
    cy.assertTitle('admin');

    cy.contains('button', 'Upload collection').should('not.exist');
    cy.contains('button', 'Upload new version').should('not.exist');
  });

  it('gets Unauthorized elsewhere', () => {
    cy.visit(`${uiPrefix}ansible/repositories`);
    cy.contains('You do not have access to Automation Hub');
    cy.contains('.pf-v5-c-button', 'Login');
  });
});
