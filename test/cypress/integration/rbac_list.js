describe('RBAC table contains correct headers and filter', () => {
  before(() => {
    cy.login();
    cy.visit('/ui/roles');
  });

  it('table contains all columns and filter', () => {
    cy.login();
    cy.visit('/ui/roles');
    cy.contains('Roles');

    // ensure role names begin with 'galaxy.'
    cy.get('[data-cy="name-field"]').each((name) =>
      cy.get(name).contains('galaxy.'),
    );

    //ensure proper headers
    [('Role name', 'Description', 'Created', 'Locked')].forEach((item) => {
      cy.get('tr[data-cy="SortTable-headers"] th').contains(item);
    });
  });
});
