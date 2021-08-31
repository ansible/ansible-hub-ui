import { range, sortBy } from 'lodash';

describe('User list tests for sorting, paging and filtering', () => {
  let items = [];
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  before(() => {
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();

    range(20).forEach((i) => {
      let item = { name: 'user_test' + i };
      items.push(item);
      cy.galaxykit('user create', item.name, item.name + 'password');
    });

    items.push({ name: 'admin' });

    items = sortBy(items, 'name');
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.visit('/ui/users');
  });

  it('table contains all columns', () => {
    cy.contains('Username');
    cy.contains('First name');
    cy.contains('Last name');
    cy.contains('Email');
    cy.contains('Groups');
    cy.contains('Created');

    [
      'Username',
      'First name',
      'Last name',
      'Email',
      'Groups',
      'Created',
    ].forEach((item) => {
      cy.get('tr[aria-labelledby="headers"] th').contains(item);
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
