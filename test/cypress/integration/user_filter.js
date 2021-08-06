// This tests the filter on user page. Should apply partial matchMedia.

describe('Search for users', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  before(() => {
    cy.deleteTestUsers();
  });

  beforeEach(() => {
    cy.login(adminUsername, adminPassword);
    cy.menuGo('User Access > Users');
  });

  let usernamefilterInput = () => {
    return cy.get('input[aria-label="username__contains"]').click();
  };

  let firstnamefilterInput = () => {
    return cy.get('input[aria-label="first_name__contains"]').click();
  };

  let lastnamefilterInput = () => {
    return cy.get('input[aria-label="last_name__contains"]').click();
  };

  let emailfilterInput = () => {
    return cy.get('input[aria-label="email__contains"]').click();
  };

  let checkUserEntry = () => {
    return cy
      .get('tbody > tr[aria-labelledby="new_user"] > td > a')
      .contains('new_user')
      .should('be.visible');
  };

  let search = () => {
    return cy
      .get(
        '.pf-c-toolbar__item > .pf-c-input-group > .pf-c-button.pf-m-control',
      )
      .click();
  };

  let filterDropdown = () => {
    return cy
      .get('.pf-c-toolbar__item > .pf-c-input-group > .pf-c-dropdown')
      .click();
  };

  let chooseField = () => {
    return cy.get('.pf-c-dropdown__menu > li > a');
  };

  let emptyState = () => {
    return cy
      .get('.pf-c-empty-state__content > .pf-c-title')
      .should('have.text', 'No results found');
  };

  it('filters users', () => {
    // should have title
    cy.get('.pf-c-title').should('have.text', 'Users');

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
