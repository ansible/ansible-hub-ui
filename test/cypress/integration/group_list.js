import { range, sortBy } from 'lodash';

describe('Group list tests for sorting, paging and filtering', () => {
  let items = [];
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();

    range(21).forEach((i) => {
      let item = { name: 'group_test' + i };
      items.push(item);
      cy.galaxykit('-i group create', item.name);
    });

    items = sortBy(items, 'name');
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
  });

  it('table contains all columns', () => {
    cy.contains('Group');
  });

  it('items are sorted alphabetically and paging is working', () => {
    cy.visit('/ui/group-list');
    cy.get('.body:first').contains(items[0].name);

    cy.get('.body:first').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body:first').contains(items[10].name);

    cy.get('.body:first').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body:first').contains(items[20].name);
  });

  it('sorting is working', () => {
    cy.visit('/ui/group-list');
    cy.get('.body:first').get('[data-cy="sort_name"]').click();
    cy.get('.body:first').contains(items[20].name);
    cy.get('.body:first').contains(items[0].name).should('not.exist');
  });

  it('filter is working', () => {
    cy.visit('/ui/group-list');
    cy.get('.body:first')
      .get('[placeholder="Filter by group"]:first')
      .type('group_test0{enter}');
    cy.get('.body:first').contains('group_test0');
    cy.get('.body:first').contains('group_test1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.visit('/ui/group-list');
    cy.get('.body:first')
      .get('button[aria-label="Items per page"]:first')
      .click();
    cy.get('.body:first').contains('20 per page').click();

    range(20).forEach((i) => {
      cy.get('.body:first').contains(items[i].name);
    });

    cy.get('.body:first').contains(items[20].name).should('not.exist');
  });
});
