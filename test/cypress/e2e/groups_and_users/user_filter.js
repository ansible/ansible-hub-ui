// This tests the filter on user page. Should apply partial matchMedia.

describe('Search for users', () => {
  beforeEach(() => {
    cy.login();
    cy.menuGo('User Access > Users');
  });

  const usernamefilterInput = () =>
    cy.get('input[aria-label="username__contains"]').click();
  const firstnamefilterInput = () =>
    cy.get('input[aria-label="first_name__contains"]').click();
  const lastnamefilterInput = () =>
    cy.get('input[aria-label="last_name__contains"]').click();
  const emailfilterInput = () =>
    cy.get('input[aria-label="email__contains"]').click();
  const checkUserEntry = () =>
    cy
      .get('tbody > tr[data-cy="UserList-row-new_user"] > td > a')
      .contains('new_user')
      .should('be.visible');
  const search = () =>
    cy
      .get(
        '.pf-c-toolbar__item > .pf-c-input-group > .pf-c-button.pf-m-control',
      )
      .click();
  const filterDropdown = () =>
    cy.get('.pf-c-toolbar__item > .pf-c-input-group > .pf-c-dropdown').click();
  const chooseField = () => cy.get('.pf-c-dropdown__menu > li > a');
  const emptyState = () =>
    cy
      .get('.pf-c-empty-state__content > .pf-c-title')
      .should('have.text', 'No results found');

  it('filters users', () => {
    // should have title
    cy.assertTitle('Users');

    // creates a new user
    cy.createUser(
      'new_user',
      'veryhardpassword',
      'first_name',
      'last_name',
      'new_user@example.com',
    );

    // filters by username
    usernamefilterInput().type('new_user');
    search();
    checkUserEntry();
    usernamefilterInput().clear().type('new_us');
    search();
    checkUserEntry();
    usernamefilterInput().clear().type('new_userrrrr');
    search();
    emptyState();
    cy.contains('.pf-c-chip-group.pf-m-category', 'Username')
      .get('button[data-ouia-component-id=close]')
      .click();

    // filters by first name
    filterDropdown();
    chooseField().contains('First name').click();
    firstnamefilterInput().type('first_name');
    search();
    checkUserEntry();
    firstnamefilterInput().clear().type('first_na');
    search();
    checkUserEntry();
    firstnamefilterInput().clear().type('first_nammmmm');
    search();
    emptyState();
    cy.contains('.pf-c-chip-group.pf-m-category', 'First name')
      .get('button[data-ouia-component-id=close]')
      .click();

    // filters by last name
    filterDropdown();
    chooseField().contains('Last name').click();
    lastnamefilterInput().type('last_name');
    search();
    checkUserEntry();
    lastnamefilterInput().clear().type('last_na');
    search();
    checkUserEntry();
    lastnamefilterInput().clear().type('last_nammmmm');
    search();
    emptyState();
    cy.contains('.pf-c-chip-group.pf-m-category', 'Last name')
      .get('button[data-ouia-component-id=close]')
      .click();

    // filters by email
    filterDropdown();
    chooseField().contains('Email').click();
    emailfilterInput().type('new_user@example.com');
    search();
    checkUserEntry();
    emailfilterInput().clear().type('new_user@example');
    search();
    checkUserEntry();
    emailfilterInput().clear().type('new_user@example.commmm');
    search();
    emptyState();
    cy.contains('.pf-c-chip-group.pf-m-category', 'Email')
      .get('button[data-ouia-component-id=close]')
      .click();
  });
});
