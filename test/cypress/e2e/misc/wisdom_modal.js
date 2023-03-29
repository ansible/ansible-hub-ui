const uiPrefix = Cypress.env('uiPrefix');

function clickWisdomSettings() {
  cy.get('[data-cy="kebab-toggle"] button[aria-label="Actions"]').click({
    force: true,
  });
  cy.contains('[data-cy="kebab-toggle"] a', 'Wisdom settings').click({
    force: true,
  });
}

function optIn() {
  clickWisdomSettings();
  cy.contains('button', 'Opt in to Wisdom').click();
  cy.contains('Namespace testns1 is opted in to Wisdom.');
}

function optOut() {
  clickWisdomSettings();
  cy.contains('button', 'Opt out of Wisdom').click();
  cy.contains('Namespace testns1 is opted out of Wisdom.');
}

describe('Wisdom Modal Test', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
  });

  it('can opt in or opt out of namespace.', () => {
    cy.login();
    cy.visit(`${uiPrefix}namespaces/testns1`);
    optOut();
    optIn();
    clickWisdomSettings();
    cy.contains('button', 'Opt out of Wisdom');
  });

  // We will unskip this test after this functionality is implemented on the backend (AAH-2166)
  it.skip('does remove namespace from deny list when namespace deleted.', () => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/testns1`);

    optOut();

    // namespace was removed from wisdom, now delete it and it should be in wisdom again after recreation
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.visit(`${uiPrefix}namespaces/testns1`);

    // it should be again in wisdom
    clickWisdomSettings();
    cy.contains('button', 'Opt out of Wisdom');
  });
});
