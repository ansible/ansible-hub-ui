let baseUrl = Cypress.config().baseUrl;
let adminUsername = Cypress.env('username');
let adminPassword = Cypress.env('password');

beforeEach(() => {
  cy.visit(baseUrl);
});

describe('edit an existing namespace', () => {
    beforeEach('login', () => {
        cy.login(adminUsername, adminPassword);
        cy.on('uncaught:exception', (err, runnable) => {
          return false;
        });
        const collectionTab = cy.menuPresent('Namespaces');
        collectionTab.click({ force: true });
    })
  describe('create a namespace', () => {
    it.only('creates a new namespace', () => {
     
      const createNamespaceButton = cy.get('[data-cy=create-namespace]');
      createNamespaceButton.click();
      cy.get('#pf-modal-part-2 #newNamespaceName').type('mynewnamespace11');
      const message = cy.get('.pf-c-form__helper-text');
      message.should('have.text', 'Please, provide the namespace name');
      const create = cy.get('[data-cy=create]');
      create.should('be.enabled');
      create.click();
      const url = cy.url();
      url.should(
        'eq',
        'http://localhost:8002/ui/my-namespaces/mynewnamespace11',
      );
    });
  });
  describe('edit a namespace', () => {
      it.only('finds individual card', () => {
          cy.get('.pf-c-card__title').contains('Arista');
      })
      it('finds editing page', () => {
        cy.get('[data-cy=view-collections]').click();
      })
      
  })

//   describe('test all fields', () => {
//     it.only('tests first field', () => {
    
//     });
//   });

//   describe('add and removes links', () => {
//     it('adds a link', () => {});
//     it('removes a link', () => {});
//   });
});
