const uiPrefix = Cypress.env('uiPrefix');

function communityLogin() {
  cy.login(null, null, '/', 'Welcome to Galaxy');
}

function clickLightspeedSettings() {
  cy.get('[data-cy="kebab-toggle"] button[aria-label="Actions"]').click({
    force: true,
  });
  cy.contains(
    '[data-cy="kebab-toggle"] a',
    'Ansible Lightspeed settings',
  ).click({
    force: true,
  });
}

function optIn() {
  clickLightspeedSettings();
  cy.contains('button', 'Opt in to Ansible Lightspeed').click();
  cy.contains('Namespace testns1 is opted in to Ansible Lightspeed.');
}

function optOut() {
  clickLightspeedSettings();
  cy.contains('button', 'Opt out of Ansible Lightspeed').click();
  cy.contains('Namespace testns1 is opted out of Ansible Lightspeed.');
}

describe('Ansible Lightspeed Modal Test', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
  });

  it('can opt in or opt out of namespace.', () => {
    communityLogin();
    cy.visit(`${uiPrefix}namespaces/testns1`);
    optOut();
    optIn();
    clickLightspeedSettings();
    cy.contains('button', 'Opt out of Ansible Lightspeed');
  });

  // We will unskip this test after this functionality is implemented on the backend (AAH-2166)
  it.skip('does remove namespace from deny list when namespace deleted.', () => {
    communityLogin();
    cy.visit(`${uiPrefix}repo/published/testns1`);

    optOut();

    // namespace was removed from lightspeed, now delete it and it should be in lightspeed again after recreation
    cy.deleteNamespacesAndCollections();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.visit(`${uiPrefix}namespaces/testns1`);

    // it should be again in lightspeed
    clickLightspeedSettings();
    cy.contains('button', 'Opt out of Ansible Lightspeed');
  });
});
