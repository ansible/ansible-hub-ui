const uiPrefix = Cypress.env('uiPrefix');

describe('Edit a namespace', () => {
  let kebabToggle = () => {
    cy.get('[data-cy="ns-kebab-toggle"] button[aria-label="Actions"]').click({
      force: true,
    });
  };

  let saveButton = () => {
    return cy.contains('Save');
  };

  let getLinkTextField = () => {
    return cy
      .get('div.useful-links > div.link-name input')
      .invoke('attr', 'placeholder', 'Link text')
      .click();
  };

  let getUrlField = () => {
    return cy.get('div.useful-links div.link-url #url').click();
  };

  let linksHelper = () => {
    return cy.get('#links-helper');
  };

  let getEditTab = () => {
    return cy
      .get(
        'ul.pf-c-tabs__list > li.pf-c-tabs__item > button > span.pf-c-tabs__item-text',
      )
      .contains('Edit resources')
      .click();
  };

  let getTextField = () => {
    return cy.get('div.pf-c-form__group-control > textarea.pf-c-form-control');
  };

  before(() => {
    cy.deleteTestGroups();
    cy.galaxykit('-i group create', 'namespace-owner-autocomplete');
  });

  beforeEach(() => {
    cy.login();
    cy.galaxykit('-i namespace create', 'testns1');
    cy.goToNamespaces();
    cy.get(`a[href*="${uiPrefix}namespaces/testns1"]`).click();
    cy.contains('No collections yet');
    kebabToggle();
    cy.contains('Edit namespace').click();
  });

  it('tests that the name field is disabled from editing', () => {
    cy.get('#name').should('be.disabled');
  });

  it('tests the company name for errors', () => {
    cy.get('#company')
      .clear()
      .type(
        'This name is too long vaðlaheiðarvegavinnuverkfærageymsluskúraútidyralyklakippuhringur',
      );
    saveButton().click();
    let helperText = cy.get('#company-helper');
    helperText.should(
      'have.text',
      'Ensure this field has no more than 64 characters.',
    );
  });

  it('saves a new company name', () => {
    cy.get('#company').clear().type('Company name');
    saveButton().click();
    cy.url().should('match', new RegExp(`${uiPrefix}namespaces/testns1`));
    cy.get('.pf-c-title').should('contain', 'Company name');
  });

  it('tests the Logo URL field', () => {
    const url = 'https://example.com/';
    cy.get('#avatar_url').clear().type('abcde');
    saveButton().click();
    cy.get('#avatar_url-helper').should('have.text', 'Enter a valid URL.');
    cy.get('#avatar_url').clear().type(url);
    saveButton().click();
    cy.get('div.title-box > div.image > img').should('have.attr', 'src', url);
  });

  it('tests the Description field', () => {
    cy.get('#description').type(`
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas magna velit, tempor at interdum viverra, egestas quis libero. Aenean arcu magna, sodales ut dictum accumsan, consectetur vitae mi. Maecenas efficitur ipsum a orci condimentum, in lobortis turpis accumsan. Vivamus non libero varius, vulputate nunc vitae, posuere risus. In ut malesuada magna. Cras ac rhoncus mi. Nulla tempus semper interdum. Aliquam scelerisque, purus quis vestibulum finibus, dolor augue dictum erat, id commodo justo quam non metus.`);
    saveButton().click();
    cy.get('#description-helper').should(
      'have.text',
      'Ensure this field has no more than 256 characters.',
    );
    cy.get('#description').clear().type('A namespace description');
    saveButton().click();
    cy.get('.header-bottom').should('contain', 'A namespace description');
  });

  it('tests the Links field', () => {
    getLinkTextField().first().type('Too long ^TrR>dG(F55:5(P:!sdafd#ZWCf2');
    getUrlField().first().type('https://example.com');
    saveButton().click();
    linksHelper().should(
      'contain',
      'Text: Ensure this field has no more than 32 characters.',
    );
    getLinkTextField().first().clear();
    cy.contains('.useful-links', 'Name must not be empty.');

    getLinkTextField().first().type('Link to example website');
    getUrlField().first().clear();
    cy.contains('.useful-links', 'URL must not be empty.');

    getUrlField().first().type('example.com');
    cy.contains('.useful-links', 'The URL needs to be in');

    getUrlField().first().clear().type('https://example.com/');
    saveButton().click();
    cy.get('div.link a')
      .should('contain', 'Link to example website')
      .and('have.attr', 'href', 'https://example.com/');
  });

  it('removes a link', () => {
    cy.get(
      'div.useful-links:first-child > div.link-button > div.link-container svg',
    )
      .first()
      .click();
    saveButton().click();
  });

  it('edits namespace resources', () => {
    getEditTab();
    getTextField()
      .invoke('attr', 'placeholder')
      .should(
        'contain',
        '## Custom resources\n\nYou can use this page to add any resources which you think might help your users automate all the things.',
      );
    getTextField().click().type('Editing the readme file');
    saveButton().click();
    kebabToggle();
    cy.contains('Edit namespace').click();
    getEditTab();
    getTextField().should('contain', 'Editing the readme file');
  });
});
