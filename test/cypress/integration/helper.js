

describe('Edit a namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');


  let createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };

  let chooseCard = () => {
    let card = document.querySelectorAll('.ns-card-container');
    return card.find('.pf-c-card')
  
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

  it.only('finds namespace card', () => {
    chooseCard();
  });

  it('finds testns1', () => {
    cy.contains('testns1');
  });

  //   it('clicks the kebab button', () => {
  //       cy.get('[data-cy=kebab-toggle]').click()
  //   });
});
