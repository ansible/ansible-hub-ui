describe('Hub Menu Tests', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let menuItems = [
    'Collections > Collections',
    'Collections > Namespaces',
    'Collections > Repository Management',
    'Collections > API Token',
    'Collections > Approval',
    'Container Registry',
    'Documentation',
    'User Access > Users',
    'User Access > Groups',
  ];

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it('admin user sees complete menu', () => {
    cy.login(adminUsername, adminPassword);
    menuItems.forEach(item => cy.menuPresent(item));
  });

  describe('user without permissions', () => {
    let username = 'nopermission';
    let password = 'n0permissi0n';
    let visibleMenuItems = [
      'Collections > Collections',
      'Collections > Namespaces',
      'Collections > Repository Management',
      'Collections > API Token',
      'Container Registry',
      'Documentation',
    ];
    let missingMenuItems = [
      'User Access > Users',
      'User Access > Groups',
      'Collections > Approval',
    ];

    before(() => {
      cy.login(adminUsername, adminPassword);
      cy.createUser(username, password);
      cy.logout();
    });

    after(() => {
      cy.deleteUser(username);
      cy.logout();
    });

    it('sees limited menu', () => {
      cy.login(username, password);
      visibleMenuItems.forEach(item => cy.menuPresent(item));
      missingMenuItems.forEach(item => cy.menuMissing(item));
      cy.logout();
    });

    it('has Documentation tab', () => {
      cy.login(username, password);
      cy.menuPresent('Documentation').should(
        'have.attr',
        'href',
        'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
      );
      cy.logout();
    });
  });
});
