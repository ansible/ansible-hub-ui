describe('Execution Environments - Use in Controller', () => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');
  let num = (~~(Math.random() * 1000000)).toString(); // FIXME: maybe drop everywhere once AAH-1095 is fixed

  before(() => {
    cy.login(adminUsername, adminPassword);

    cy.deleteRegistries();
    cy.deleteContainers();

    // FIXME: add galaxykit support for remote registries
    cy.addRemoteRegistry(`docker${num}`, 'https://registry.hub.docker.com/');

    cy.addRemoteContainer({
      name: `remotepine${num}`,
      upstream_name: 'library/alpine',
      registry: `docker${num}`,
      include_tags: 'latest',
    });
    cy.syncRemoteContainer(`remotepine${num}`);

    cy.addLocalContainer(`localpine${num}`, 'alpine');
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.menuGo('Execution Environments > Execution Environments');
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/controllers/?*', {
      body: {
        data: [
          { host: 'https://www.example.com' },
          { host: 'https://another.example.com' },
        ],
        meta: { count: 2 },
      },
    });
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
      cy.get('tr[aria-labelledby="headers"] th').contains(header),
    );

    // one row of each type available
    cy.contains('.content-table .pf-c-label', 'Remote');
    cy.contains('.content-table .pf-c-label', 'Local');
  });

  const list = (type) =>
    cy
      .contains('.content-table .pf-c-label', type)
      .parents('tr')
      .find('button[aria-label="Actions"]')
      .click()
      .parents('tr')
      .contains('.pf-c-dropdown__menu-item', 'Use in Controller')
      .click();

  const detail = (type) => {
    cy.contains('.content-table .pf-c-label', type)
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
        cy.contains('.pf-c-select__menu', 'latest').click();
        cy.contains('a', 'https://another.example.com')
          .should('have.attr', 'href')
          .and(
            'match',
            /^https:\/\/another\.example\.com\/#\/execution_environments\/add\?image=.*latest$/,
          );

        // leave
        cy.get('button[aria-label="Close"]').click();
      });
    });
  });
});
