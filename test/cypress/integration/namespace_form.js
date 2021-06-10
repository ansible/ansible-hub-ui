describe('creating a new namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it('creates a new namespace', () => {
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    const collectionTab = cy.menuPresent('Namespaces');
    collectionTab.click({ force: true });
    const createNamespaceButton = cy.get('[data-cy=create-namespace]');
    createNamespaceButton.click();
    cy.get('#pf-modal-part-2 #newNamespaceName').type('my3newnamespace24');
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', 'Please, provide the namespace name');
    const create = cy.get('[data-cy=create]');
    create.should('be.enabled');
    create.click();

    const url = cy.url();
    url.should(
      'eq',
      'http://localhost:8002/ui/my-namespaces/my3newnamespace24',
    );
  });

  it('throws error message with incorrect name', () => {
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    const collectionTab = cy.menuPresent('Namespaces');
    collectionTab.click({ force: true });
    const createNamespaceButton = cy.get('[data-cy=create-namespace]');
    createNamespaceButton.click();
    const create = cy.get('[data-cy=create]');
    create.should('be.disabled');
    // before typing anything
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', 'Please, provide the namespace name');
    // type space
    const inputBox = cy.get('#pf-modal-part-2 #newNamespaceName');
    inputBox.type(' ');
    cy.get('[data-cy=create]').should('be.disabled');
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', 'Name can only contain [A-Za-z0-9_]');
    cy.get('#pf-modal-part-2 #newNamespaceName').clear();
    // incorrect characters
    const inputBox = cy.get('#pf-modal-part-2 #newNamespaceName');
    inputBox.type('!/^[a-zA-Z0-9_]+$/.');
    cy.get('[data-cy=create]').should('be.disabled');
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', 'Name can only contain [A-Za-z0-9_]');
    cy.get('#pf-modal-part-2 #newNamespaceName').clear();
    // shorter than 3 characters
    const inputBox = cy.get('#pf-modal-part-2 #newNamespaceName');
    inputBox.type('na');
    cy.get('[data-cy=create]').should('be.disabled');
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', 'Name must be longer than 2 characters');
    cy.get('#pf-modal-part-2 #newNamespaceName').clear();
    //   begins with underscore
    const inputBox = cy.get('#pf-modal-part-2 #newNamespaceName');
    inputBox.type('_my8new8namespace');
    cy.get('[data-cy=create]').should('be.disabled');
    const message = cy.get('.pf-c-form__helper-text');
    message.should('have.text', "Name cannot begin with '_'");
    cy.get('#pf-modal-part-2 #newNamespaceName').clear();

  // same name as existing namespace
    const inputBox = cy.get('#pf-modal-part-2 #newNamespaceName');
    inputBox.type('my4new8namespace24');
    const create = cy.get('[data-cy=create]');
    create.click();
    const message = cy.get('.pf-c-form__helper-text');
    message.should(
      'have.text',
      'A namespace named my4new8namespace24 already exists.',
    );
  });
});
