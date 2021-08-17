describe('Group Table Tests for Sorting, Paging and Filtering', () => {
  let items = [];
  let prefix = 'group_table_test';
  let selector = '.body:first';

  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();

    cy.login('admin', 'admin');

    for (var i = 0; i < 21; i++) {
      let item = { name: prefix + i };
      items.push(item);
      cy.galaxykit('-i group create', item.name);
    }

    cy.sortBy(items, 'name', true);
  });

  beforeEach(() => {
    cy.login('admin', 'admin');
  });

  it('items are sorted alphabetically and paging is working', () => {
    var new_items = items.slice(0, 10);
    cy.visit('/ui/group-list');
    cy.checkTableItems(selector, new_items, 'name');
    cy.get('[aria-label="Go to next page"]:first').click();

    new_items = items.slice(10, 20);
    cy.checkTableItems(selector, new_items, 'name');
    cy.get('[aria-label="Go to next page"]:first').click();

    new_items = items.slice(20, 21);
    cy.checkTableItems(selector, new_items, 'name');
  });
});
