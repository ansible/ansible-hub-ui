describe('Edit a namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let kebabToggle = () => {
    return cy.get('button[id^=pf-dropdown-toggle-id-] > svg').parent().click();
  };

  let saveButton = () => {
    return cy.contains('Save');
  };

  let getLinkTextField = () => {
    return cy
      .get('div.useful-links > div.link-name > input')
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
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.galaxykit('-i namespace create', 'testns1');
    cy.menuGo('Collections > Namespaces');
    cy.get('a[href*="ui/repo/published/testns1"]').click();
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
    cy.url().should('eq', 'http://localhost:8002/ui/my-namespaces/testns1');
    cy.get('.pf-c-title').should('contain', 'Company name');
  });

  it('tests the namespace owners field', () => {
    cy.intercept('GET', Cypress.env('prefix') + '_ui/v1/groups/?*').as(
      'autocomplete',
    );

    cy.get('.pf-c-form-control.pf-c-select__toggle-typeahead')
      .click()
      .type('abcde');
    cy.wait('@autocomplete');
    cy.get('.pf-c-select__menu-wrapper').should('contain', 'Not found');

    cy.get('.pf-c-button.pf-m-plain.pf-c-select__toggle-clear').click();
    cy.wait('@autocomplete');
    cy.contains('namespace-owner-autocomplete').click();

    saveButton().click();
  });

  it('tests the Logo URL field', () => {
    cy.get('#avatar_url').clear().type('abcde');
    saveButton().click();
    cy.get('#avatar_url-helper').should('have.text', 'Enter a valid URL.');
    cy.get('#avatar_url')
      .clear()
      .type(
        'https://www.logotaglines.com/wp-content/uploads/2018/01/IBM-Logo-Tagline.jpg',
      );
    saveButton().click();
    cy.get('div.title-box > div.image > img').should(
      'have.attr',
      'src',
      'https://www.logotaglines.com/wp-content/uploads/2018/01/IBM-Logo-Tagline.jpg',
    );
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
    getLinkTextField().type('Too long ^TrR>dG(F55:5(P:!sdafd#ZWCf2');
    getUrlField().type('example.com');
    saveButton().click();
    linksHelper().should(
      'contain',
      'Text: Ensure this field has no more than 32 characters.',
    );
    getLinkTextField().clear();
    saveButton().click();
    linksHelper().should('contain', 'Text: This field may not be blank.');
    getLinkTextField().type('Link to example website');
    getUrlField().clear();
    saveButton().click();
    linksHelper().should('contain', 'URL: This field may not be blank.');
    getUrlField().type('example.com');
    saveButton().click();
    linksHelper().should('contain', "URL: 'example.com' is not a valid url.");
    getUrlField().clear().type('https://example.com/');
    saveButton().click();
    cy.get('div.link > a')
      .should('contain', 'Link to example website')
      .and('have.attr', 'href', 'https://example.com/');
  });

  it('removes a link', () => {
    cy.get(
      'div.useful-links:first-child > div.link-button > div.link-container > svg > path[d^=M432]',
    ).click();
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
