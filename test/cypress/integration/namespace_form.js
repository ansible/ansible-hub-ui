describe('A namespace form', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let getCreateNamespace = () => {
    return cy.get('.pf-c-button.pf-m-primary');
  };
  let getMessage = () => {
    return cy.get('.pf-c-form__helper-text');
  };
  let getCreateButton = () => {
    return cy.get('[aria-label=Submit]');
  };
  let getInputBox = () => {
    return cy.get('#pf-modal-part-2 #newNamespaceName');
  };
  let clearInput = () => {
    return cy.get('#pf-modal-part-2 #newNamespaceName').clear();
  };
  let createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };
  let getUrl = () => {
    return cy.url();
  };

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    createNamespace();
    cy.menuGo('Collections > Namespaces');
    getCreateNamespace().click();
  });

  it('should give message before typing', () => {
    getMessage().should('have.text', 'Please, provide the namespace name');
    getCreateButton().should('be.disabled');
  });
  it('should give message if input is empty', () => {
    getInputBox().type(' ');
    getMessage().should('have.text', 'Name can only contain [A-Za-z0-9_]');
    getCreateButton().should('be.disabled');
    clearInput();
  });
  it('should give message if input has incorrect characters', () => {
    getInputBox().type('!/^[a-zA-Z0-9_]+$/.');
    getMessage().should('have.text', 'Name can only contain [A-Za-z0-9_]');
    getCreateButton().should('be.disabled');
    clearInput();
  });
  it('should give message if input is shorter than 3 characters', () => {
    getInputBox().type('na');
    getMessage().should('have.text', 'Name must be longer than 2 characters');
    getCreateButton().should('be.disabled');
    clearInput();
  });
  it('should give message if input begins with underscore', () => {
    getInputBox().type('_namespace');
    getMessage().should('have.text', "Name cannot begin with '_'");
    getCreateButton().should('be.disabled');
    clearInput();
  });
  it('should give message if name already exists', () => {
    getInputBox().type('testns1');
    getCreateButton().click();
    getCreateButton().should('be.disabled');
    getMessage().should(
      'have.text',
      'A namespace named testns1 already exists.',
    );
    clearInput();
  });

  // Note: the next test should work the first time, but not on rerun. to reset DB via CLI (from galaxy_ng dir):

  // ./compose down --volume
  // ./compose up -d postgres redis
  // ./compose run --rm api manage migrate
  // ./compose run --rm -e PULP_FIXTURE_DIRS='["/src/galaxy_ng/dev/automation-hub"]' api manage loaddata initial_data.json

  it('creates a new namespace with no error messages', () => {
    getInputBox().type('testns2');
    getCreateButton().click();
    getUrl().should('eq', 'http://localhost:8002/ui/my-namespaces/testns2');
  });
});
