let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  beforeEach(() => {
    cy.visit(baseUrl);
  });


describe('edit an existing namespace', () => {
    describe('create a namespace', () => {
        
    })
    describe('test all fields', () => {
        it('tests first field', () => {
            cy.login(adminUsername, adminPassword);
            cy.on('uncaught:exception', (err, runnable) => {
              return false;
            });
            const collectionTab = cy.menuPresent('Namespaces');
            collectionTab.click({ force: true });

        })
    })
    describe('add and removes links', () => {
        it('adds a link', () => {

        })
        it('removes a link', () => {

        })
    })
})