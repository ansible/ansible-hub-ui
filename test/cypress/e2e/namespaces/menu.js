describe('Hub Menu Tests', () => {
  const username = 'nopermission';
  const password = 'n0permissi0n';

  const menuItems = [
    'Collections > Collections',
    'Collections > Namespaces',
    'Collections > Repositories',
    'Collections > Remotes',
    'Collections > API token',
    'Collections > Approval',
    'Task Management',
    'Signature Keys',
    'User Access > Users',
    'User Access > Groups',
    'User Access > Roles',
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
    const visibleMenuItems = [
      'Collections > API token',
      'Collections > Collections',
      'Collections > Namespaces',
      'Collections > Repositories',
      'Signature Keys',
      'Task Management',
    ];
    const missingMenuItems = [
      'Collections > Approval',
      'Collections > Remotes',
      'User Access > Groups',
      'User Access > Roles',
      'User Access > Users',
    ];

    it('sees limited menu', () => {
      cy.login(username, password);

      visibleMenuItems.forEach((item) => cy.menuPresent(item));
      missingMenuItems.forEach((item) => cy.menuMissing(item));
    });
  });
});
