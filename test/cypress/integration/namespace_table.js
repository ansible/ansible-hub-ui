describe('Namespaces Table Tests for Sorting, Paging and Filtering', () => {
  let items = [];
  let prefix = 'namespace_table_test';
  let selector = '.namespace-page';

  before(() => {
    cy.login('admin', 'admin');

    // note - system dont allow to delete namespaces
    for (var i = 0; i < 21; i++) {
      let item = { name: prefix + i };
      items.push(item);
      cy.galaxykit('-i namespace create', item.name);
    }

    cy.sortBy(items, 'name', true);
  });

  beforeEach(() => {
    cy.login('admin', 'admin');
  });

  it('items are sorted alphabetically and paging is working', () => {
    var new_items = items.slice(0, 20);
    cy.visit('/ui/namespaces');
    cy.checkTableItems(selector, new_items, 'name');
    cy.get('[aria-label="Go to next page"]:first').click();
    new_items = items.slice(20, 21);
    cy.checkTableItems(selector, new_items, 'name');
  });
});
