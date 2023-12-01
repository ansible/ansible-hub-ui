const uiPrefix = Cypress.env('uiPrefix');

function clickWisdomSettings() {
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
  clickWisdomSettings();
  cy.contains('button', 'Opt in to Ansible Lightspeed').click();
  cy.contains('Namespace testns1 is opted in to Ansible Lightspeed.');
}

function optOut() {
  clickWisdomSettings();
  cy.contains('button', 'Opt out of Ansible Lightspeed').click();
  cy.contains('Namespace testns1 is opted out of Ansible Lightspeed.');
}

describe('Ansible Lightspeed Modal Test', () => {
  before(() => {
    cy.galaxykit('-i namespace create', 'testns1');
  });

  it('can opt in or opt out of namespace.', () => {
    cy.login(null, null, '/', 'Welcome to Galaxy');
    cy.visit(`${uiPrefix}namespaces/testns1`);
    optOut();
    optIn();
    clickWisdomSettings();
    cy.contains('button', 'Opt out of Ansible Lightspeed');
  });
});
