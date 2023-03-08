describe('Hub Menu Tests', () => {
  let username = 'nopermission';
  let password = 'n0permissi0n';

  let menuItems = [
    'Collections > Collections',
    'Collections > Namespaces',
    'Collections > Repository Management',
    'Collections > API token management',
    'Collections > Approval',
    'Execution Environments > Execution Environments',
    'Execution Environments > Remote Registries',
    'Task Management',
    'Documentation',
    'User Access > Users',
    'User Access > Groups',
  ];

  before(() => {
    cy.deleteTestUsers();

    cy.galaxykit('user create', username, password);
  });

  it('admin user sees complete menu', () => {
    cy.login();

    menuItems.forEach((item) => cy.menuPresent(item));
  });

  describe('user without permissions', () => {
    // one more similar test in view-only
    let visibleMenuItems = [
      'Collections > Collections',
      'Collections > Namespaces',
      'Collections > Repository Management',
      'Collections > API token management',
      'Execution Environments > Execution Environments',
      'Execution Environments > Remote Registries',
      'Task Management',
      'Documentation',
    ];
    let missingMenuItems = [
      'User Access > Users',
      'User Access > Groups',
      'Collections > Approval',
    ];

    it('sees limited menu', () => {
      cy.login(username, password);

      visibleMenuItems.forEach((item) => cy.menuPresent(item));
      missingMenuItems.forEach((item) => cy.menuMissing(item));
    });

    it('has Documentation tab', () => {
      cy.login(username, password);

      cy.menuPresent('Documentation').should(
        'have.attr',
        'href',
        'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
      );
    });
  });
});
