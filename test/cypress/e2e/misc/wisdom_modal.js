const uiPrefix = Cypress.env('uiPrefix');

describe('Wisdom Modal Test', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
  });

  it('can opt in or opt out of namespace.', () => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/testns1`);
    cy.get('main button[aria-label="Actions"]').click();
    cy.contains('main a', 'Wisdom Settings').click();
    cy.contains('button', 'Opt out of Wisdom').click();
    cy.contains('button', 'Opt in Wisdom').click();
    cy.contains('button', 'Opt out of Wisdom');
  });
});
