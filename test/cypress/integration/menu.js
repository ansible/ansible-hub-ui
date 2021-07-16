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

  it('admin user sees complete menu', () => {
    cy.cookieLogin(adminUsername, adminPassword);
    menuItems.forEach(item => cy.menuPresent(item));
  });

  describe('user without permissions', () => {
    let username = 'nopermission';
    let password = 'n0permissi0n';

    before(() => {
      cy.deleteTestUsers();
      cy.galaxykit('user create', username, password);
    });

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

    it('sees limited menu', () => {
      cy.cookieLogin(username, password);
      visibleMenuItems.forEach(item => cy.menuPresent(item));
      missingMenuItems.forEach(item => cy.menuMissing(item));
    });

    it('has Documentation tab', () => {
      cy.cookieLogin(username, password);
      cy.menuPresent('Documentation').should(
        'have.attr',
        'href',
        'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
      );
    });
  });
});
