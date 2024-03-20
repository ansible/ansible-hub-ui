import { range, sortBy } from 'lodash';

const uiPrefix = Cypress.env('uiPrefix');

describe('User list tests for sorting, paging and filtering', () => {
  let items = [];

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();

    range(20).forEach((i) => {
      const name = 'user_test' + i;
      items.push({ name });
      cy.galaxykit('user create', name, name + 'password');
    });

    items.push({ name: 'admin' });

    items = sortBy(items, 'name');
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

  it('items are sorted alphabetically and paging is working', () => {
    cy.get('.body').contains(items[0].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[10].name);

    cy.get('.body').get('[aria-label="Go to next page"]:first').click();
    cy.get('.body').contains(items[20].name);
  });

  it('sorting is working for username', () => {
    cy.get('.body').get('[data-cy="sort_username"]').click();
    cy.get('.body tbody tr:first td:first').contains(items[20].name);
    cy.get('.body').contains(items[0].name).should('not.exist');
  });

  it('filter is working', () => {
    cy.get('.body')
      .get('[aria-label="username__contains"]:first')
      .type('user_test0{enter}');
    cy.get('.body').contains('user_test0');
    cy.get('.body').contains('user_test1').should('not.exist');
  });

  it('set page size is working', () => {
    cy.get('.body')
      .get('[data-ouia-component-type="PF5/Pagination"] button:first')
      .click();
    cy.get('.body').contains('20 per page').click();

    range(20).forEach((i) => {
      cy.get('.body').contains(items[i].name);
    });

    cy.get('.body').contains(items[20].name).should('not.exist');
  });
});
