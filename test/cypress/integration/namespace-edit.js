describe('Edit a namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };
  let viewNamespaceDetail = () => {
    return cy.get('a[href*="ui/repo/published/testns1"]').click();
  };
  let kebabToggle = () => {
    return cy.get('#pf-dropdown-toggle-id-11').click();
  };
  let editNamespace = () => {
    return cy.contains('Edit namespace').click();
  };

  let saveButton = () => {
    return cy.contains('Save').click();
  };
  let getUrl = () => {
    return cy.url();
  };
  let checkName = () => {
    return cy.get('#name').should('be.disabled');
  };
  let getCompanyName = () => {
    return cy.get('#company');
  };
  let checkCompanyName = () => {
    getCompanyName()
      .clear()
      .type(
        'This name is too long vaðlaheiðarvegavinnuverkfærageymsluskúraútidyralyklakippuhringur',
      );
    saveButton();
    let helperText = cy.get('#company-helper');
    helperText.should(
      'have.text',
      'Ensure this field has no more than 64 characters.',
    );
  };

  let saveCompanyName = () => {
    getCompanyName()
      .clear()
      .type('Company name');
    saveButton();
    getUrl().should('eq', 'http://localhost:8002/ui/my-namespaces/testns1');
  };
  before(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    createNamespace();
    cy.menuGo('Collections > Namespaces');
    viewNamespaceDetail();
    kebabToggle();
    editNamespace();
  });

  it('tests that the name field is disabled from editing', () => {
    checkName();
  });
  it('tests the company name for errors', () => {
    checkCompanyName();
  });
  it('saves a new company name', () => {
    saveCompanyName();
    cy.get('.pf-c-title').should('contain', 'Company name');
  });
});
