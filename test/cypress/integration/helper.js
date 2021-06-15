describe('Edit a namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };

  let viewNamespaceDetail = () => {
    let link = cy.get('a[href*="ui/repo/published/testns1"]').click();
    return link;
  };

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    createNamespace();
    cy.menuGo('Collections > Namespaces');
  });

  it('deletes testns1 namespace', () => {
    viewNamespaceDetail();
    kebabToggle();
  });
});
