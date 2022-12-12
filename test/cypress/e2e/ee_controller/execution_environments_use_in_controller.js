const uiPrefix = Cypress.env('uiPrefix');

describe('Execution Environments - Use in Controller', () => {
  before(() => {
    cy.login();
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.addRemoteRegistry(`registry`, 'https://quay.io/');

    cy.addRemoteContainer({
      name: `remotepine`,
      upstream_name: 'ansible/docker-test-containers',
      registry: `registry`,
      include_tags: 'hello-world',
    });

    cy.visit(`${uiPrefix}containers/`);
    cy.contains('.body', `remotepine`, { timeout: 10000 });

    cy.syncRemoteContainer(`remotepine`);
    cy.addLocalContainer(`localpine`, 'alpine');
  });

  beforeEach(() => {
    cy.login();
    cy.menuGo('Execution Environments > Execution Environments');
  });

  it('admin sees containers', () => {
    // table headers
    [
      'Container repository name',
      'Description',
      'Created',
      'Last modified',
      'Container registry type',
    ].forEach((header) =>
      cy.get('tr[data-cy="SortTable-headers"] th').contains(header),
    );

    // one row of each type available
    cy.contains('.hub-c-table-content .pf-c-label', 'Remote');
    cy.contains('.hub-c-table-content .pf-c-label', 'Local');
  });

  const list = (type) =>
    cy
      .contains('.hub-c-table-content .pf-c-label', type)
      .parents('tr')
      .find('button[aria-label="Actions"]')
      .click()
      .parents('tr')
      .contains('.pf-c-dropdown__menu-item', 'Use in Controller')
      .click();

  const detail = (type) => {
    cy.contains('.hub-c-table-content .pf-c-label', type)
      .parents('tr')
      .find('td a')
      .click();

    ['Detail', 'Activity', 'Images'].forEach((tab) =>
      cy.contains('.pf-c-tabs__item', tab),
    );

    cy.get('button[aria-label="Actions"]')
      .click()
      .parent()
      .contains('.pf-c-dropdown__menu-item', 'Use in Controller')
      .click();
  };

  ['Remote', 'Local'].forEach((type) => {
    [list, detail].forEach((opener) => {
      it(`Use in Controller - ${type} ${opener.name}`, () => {
        opener(type);

        // shows links
        cy.contains('a', 'https://www.example.com')
          .should('have.attr', 'href')
          .and(
            'match',
            /^https:\/\/www\.example\.com\/#\/execution_environments\/add\?image=.*latest$/,
          );
        cy.contains('a', 'https://another.example.com');
        cy.get('ul.pf-c-list > li > a').should('have.length', 2);

        // filter controllers
        cy.get('input[placeholder="Filter by controller name"]')
          .click()
          .type('another{enter}');
        cy.contains('a', 'https://another.example.com');
        cy.get('ul.pf-c-list > li > a').should('have.length', 1);
        cy.contains('a', 'https://www.example.com').should('not.exist');

        // unset tag, see digest
        cy.get('.pf-m-typeahead .pf-c-select__toggle-clear').click();
        cy.contains('a', 'https://another.example.com')
          .should('have.attr', 'href')
          .and(
            'match',
            /^https:\/\/another\.example\.com\/#\/execution_environments\/add\?image=.*sha256.*$/,
          );

        // search tag
        cy.get('input.pf-c-select__toggle-typeahead').click();
        cy.contains('.pf-c-select__menu', 'hello-world').click();
        cy.contains('a', 'https://another.example.com')
          .should('have.attr', 'href')
          .and(
            'match',
            /^https:\/\/another\.example\.com\/#\/execution_environments\/add\?image=.*hello-world$/,
          );

        // unfilter controllers
        cy.contains('Clear all filters').click();
        cy.get('ul.pf-c-list > li > a').should('have.length', 2);

        // leave
        cy.get('button[aria-label="Close"]').click();
      });
    });
  });
});
