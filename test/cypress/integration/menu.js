describe('Hub Menu Tests', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'nopermission';
  let password = 'n0permissi0n';

  let menuItems = [
    'Collections > Collections',
    'Collections > Namespaces',
    'Collections > Repository Management',
    'Collections > API Token',
    'Collections > Approval',
    'Container Registry',
    'Task Management',
    'Documentation',
    'User Access > Users',
    'User Access > Groups',
  ];

  before(() => {
    cy.deleteTestUsers();
    cy.cookieReset();

    cy.galaxykit('user create', username, password);
  });

  it('admin user sees complete menu', () => {
    cy.cookieLogin(adminUsername, adminPassword);

    menuItems.forEach((item) => cy.menuPresent(item));
  });

  describe('user without permissions', () => {
    let visibleMenuItems = [
      'Collections > Collections',
      'Collections > Namespaces',
      'Collections > Repository Management',
      'Collections > API Token',
      'Container Registry',
      'Task Management',
      'Documentation',
    ];
    let missingMenuItems = [
      'User Access > Users',
      'User Access > Groups',
      'Collections > Approval',
    ];

    it('sees limited menu', () => {
      cy.cookieLogin(username, password);

      visibleMenuItems.forEach((item) => cy.menuPresent(item));
      missingMenuItems.forEach((item) => cy.menuMissing(item));
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
