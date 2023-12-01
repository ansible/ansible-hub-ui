const uiPrefix = Cypress.env('uiPrefix');

describe('Group list tests for sorting, paging and filtering', () => {
  before(() => {
    cy.galaxykit('-i group create', 'group1');
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}group-list`);
  });

  it('table contains all columns', () => {
    cy.get('tr[data-cy="SortTable-headers"] th').contains('Group');
  });

  it('sorting is working', () => {
    cy.get('.body').get('[data-cy="sort_name"]').click();
  });

  it('filter is working', () => {
    cy.get('.body')
      .get('[placeholder="Filter by group name"]:first')
      .type('group_test0{enter}');
    cy.get('.body').contains('group_test0');
    cy.get('.body').contains('group_test1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.body').get('button[aria-label="Items per page"]:first').click();
    cy.get('.body').contains('20 per page').click();
  });
});
