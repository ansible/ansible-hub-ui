const uiPrefix = Cypress.env('uiPrefix');

describe('A namespace form', () => {
  const getMessage = () => {
    return cy.get('.pf-v5-c-form__helper-text');
  };
  const getCreateButton = () => {
    return cy.get('.pf-v5-c-modal-box__footer .pf-m-primary');
  };
  const getInputBox = () => {
    return cy.get('input[name="newNamespaceName"]');
  };
  const clearInput = () => {
    return getInputBox().clear();
  };
  const createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };

  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.login();
    createNamespace();
    cy.visit(`${uiPrefix}partners`);
    cy.contains('button', 'Create').click();
    cy.contains('Create a new namespace');
  });

  it('should give message if input has no characters', () => {
    // error is shown only when start typing and then left empty
    getInputBox().type('A{backspace}');
    getMessage().should('have.text', 'Please, provide the namespace name');
    getCreateButton().should('be.disabled');
  });

  it('should give message if input is empty', () => {
    getInputBox().type(' ');
    getMessage().should(
      'have.text',
      'Name can only contain letters and numbers',
    );
    getCreateButton().should('be.disabled');
    clearInput();
  });

  it('should give message if input has incorrect characters', () => {
    getInputBox().type('!/^[a-zA-Z0-9_]+$/.');
    getMessage().should(
      'have.text',
      'Name can only contain letters and numbers',
    );
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

  it('creates a new namespace with no error messages', () => {
    const id = parseInt(Math.random() * 1000000);
    getInputBox().type(`testns_${id}`);
    getCreateButton().click();
    cy.url().should('match', new RegExp(`${uiPrefix}namespaces/testns_`));
  });
});
