const uiPrefix = Cypress.env('uiPrefix');

describe('Insights Menu Tests', () => {
  function menuPresent(item) {
    cy.contains(
      `[data-quickstart-id="Automation-Hub"] [data-ouia-component-id="${item}"] a`,
      item,
    );
  }

  function menuClick(item, ignoreErrors) {
    cy.contains(
      `[data-quickstart-id="Automation-Hub"] [data-ouia-component-id="${item}"] a`,
      item,
      ignoreErrors ? { failOnStatusCode: false } : {},
    ).click();
  }

  const menuItems = [
    'Collections',
    'Partners',
    //'Repositories',
    //'Remotes',
    'Task Management',
    'Connect to Hub',
  ];

  before(() => {
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login();
    cy.visit(uiPrefix);
    cy.wait(2000);
  });

  it('sees complete menu', () => {
    menuItems.forEach((item) => menuPresent(item));
  });

  it('can navigate to Collections', () => {
    menuClick('Collections');
    cy.contains('main ', 'Collections');
    cy.contains('main', 'No collections yet');
    cy.contains('main', 'Collections will appear once uploaded');
  });

  it('can navigate to Partners', () => {
    menuClick('Partners');
    cy.contains('main ', 'Partners');
    cy.contains('main', 'No namespaces yet');
  });

  it.skip('can navigate to Repositories', () => {
    menuClick('Repositories');
    cy.contains('main', 'Repositories');
    cy.contains('main .body', 'Repository name');
  });

  it.skip('can navigate to Remotess', () => {
    menuClick('Remotes');
    cy.contains('main', 'Remotes');
    cy.contains('main .body', 'Remote name');
  });

  it('can navigate to Task Management', () => {
    menuClick('Task Management');
    cy.contains('main', 'Task Management');
    cy.contains('main .body', 'Task name');
  });

  it('can navigate to Connect to Hub', () => {
    cy.on('uncaught:exception', () => {
      return false;
      // this is needed, otherwise it fails on (fetch)POST 404 /api/featureflags/v0/client/metrics
      // it seems that cy on duration is valid inside it, it does not catch api calls outisde
    });

    menuClick('Connect to Hub');
    cy.contains('main', 'Connect Private Automation Hub');
    cy.contains('main .body', 'Connect Private Automation Hub');
    cy.contains('main .body', 'Connect the ansible-galaxy client');
    cy.contains('main .body', 'Offline token');
    cy.contains('main .body', 'Manage tokens');
  });
});
