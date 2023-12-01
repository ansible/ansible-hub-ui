const uiPrefix = Cypress.env('uiPrefix');

describe('User list tests for sorting, paging and filtering', () => {
  before(() => {
    cy.galaxykit('user create', 'usertest', 'usertestp');
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}users`);
  });

  it('table contains all columns', () => {
    [
      'Username',
      'First name',
      'Last name',
      'Email',
      'Groups',
      'Created',
    ].forEach((item) => {
      cy.get('tr[data-cy="SortTable-headers"] th').contains(item);
    });
  });

  it('table contains some time informations for new users', () => {
    cy.contains('a few seconds ago');
  });

  it('filter is working', () => {
    cy.get('.body')
      .get('[aria-label="username__contains"]:first')
      .type('user_test0{enter}');
    cy.get('.body').contains('user_test0');
    cy.get('.body').contains('user_test1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.body').get('button[aria-label="Items per page"]:first').click();
    cy.get('.body').contains('20 per page').click();
  });
});
