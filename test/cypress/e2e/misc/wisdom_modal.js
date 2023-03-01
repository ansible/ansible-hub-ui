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
    cy.contains('main a', 'Wisdom settings').click();
    cy.contains('button', 'Opt out of Wisdom').click();
    cy.contains('button', 'Opt into Wisdom').click();
    cy.contains('button', 'Opt out of Wisdom');
  });

  it('does remove namespace from deny list when namespace deleted.', () => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/testns1`);
    cy.get('main button[aria-label="Actions"]').click();
    cy.contains('main a', 'Wisdom settings').click();
    cy.contains('button', 'Opt out of Wisdom').click();
    cy.contains('button', 'Opt into Wisdom');

    // namespace was removed from wisdom, now delete it and it should be in wisdom again after recreation
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.visit(`${uiPrefix}repo/published/testns1`);
    cy.get('main button[aria-label="Actions"]').click();
    cy.contains('main a', 'Wisdom settings').click();

    // it should see default state - which is opted in wisdom, thus button opt out
    cy.contains('button', 'Opt out of Wisdom');
  });
});
