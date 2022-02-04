import { range, sortBy } from 'lodash';

describe('Group list tests for sorting, paging and filtering', () => {
  let items = [];

  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();

    range(20).forEach((i) => {
      let item = { name: 'group_test' + i };
      items.push(item);
      cy.galaxykit('-i group create', item.name);
    });

    items.push({ name: 'system:partner-engineers' });

    items = sortBy(items, 'name');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/group-list');
  });

  it('table contains all columns', () => {
    cy.get('tr[aria-labelledby="headers"] th').contains('Group');
  });

  it('items are sorted alphabetically and paging is working', () => {
    cy.get('.body').contains(items[0].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[10].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[20].name);
  });

  it('sorting is working', () => {
    cy.get('.body').get('[data-cy="sort_name"]').click();
    cy.get('.body tbody tr:first td:first').contains(items[20].name);
    cy.get('.body').contains(items[0].name).should('not.exist');
  });

  it('filter is working', () => {
    cy.get('.body')
      .get('[placeholder="Filter by group"]:first')
      .type('group_test0{enter}');
    cy.get('.body').contains('group_test0');
    cy.get('.body').contains('group_test1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.body').get('button[aria-label="Items per page"]:first').click();
    cy.get('.body').contains('20 per page').click();

    range(20).forEach((i) => {
      cy.get('.body').contains(items[i].name);
    });

    cy.get('.body').contains(items[20].name).should('not.exist');
  });
});
