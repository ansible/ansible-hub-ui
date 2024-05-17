import { range } from 'lodash';

const uiPrefix = Cypress.env('uiPrefix');

describe('Group list tests for sorting, paging and filtering', () => {
  const items = [];

  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();

    range(21).forEach((i) => {
      const name = 'group_test' + i;
      items.push(name);
      cy.galaxykit('-i group create', name);
    });

    items.sort();
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}group-list`);
  });

  it('table contains all columns', () => {
    cy.get('tr[data-cy="SortTable-headers"] th').contains('Group');
  });

  it('paging', () => {
    cy.get('.body').contains(items[0]);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[10]);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[20]);
  });

  it('sorting', () => {
    cy.get('.body').get('[data-cy="sort_name"]').click();
    cy.get('.body tbody tr:first td:first').contains(items[20]);
    cy.get('.body').contains(items[0]).should('not.exist');
  });

  it('filter', () => {
    cy.get('.body')
      .get('[placeholder="Filter by group name"]:first')
      .type('group_test0{enter}');
    cy.get('.body').contains('group_test0');
    cy.get('.body').contains('group_test1').should('not.exist');
  });

  it('set page size', () => {
    cy.get('.body')
      .get('[data-ouia-component-type="PF5/Pagination"] button:first')
      .click();
    cy.get('.body').contains('20 per page').click();

    range(20).forEach((i) => {
      cy.get('.body').contains(items[i]);
    });

    cy.get('.body').contains(items[20]).should('not.exist');
  });
});
