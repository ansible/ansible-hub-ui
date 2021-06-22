describe('Edit a namespace', () => {
  let baseUrl = Cypress.config().baseUrl;
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');

  let createNamespace = () => {
    return cy.galaxykit('-i namespace create', 'testns1');
  };
  let viewNamespaceDetail = () => {
    return cy.get('a[href*="ui/repo/published/testns1"]').click();
  };
  let kebabToggle = () => {
    return cy
      .get('button[id^=pf-dropdown-toggle-id-] > svg')
      .parent()
      .click();
  };
  let editNamespace = () => {
    return cy.contains('Edit namespace').click();
  };

  let saveButton = () => {
    return cy.contains('Save');
  };
  let getUrl = () => {
    return cy.url();
  };
  let checkName = () => {
    return cy.get('#name').should('be.disabled');
  };
  let getCompanyName = () => {
    return cy.get('#company');
  };
  let checkCompanyName = () => {
    getCompanyName()
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
  };
  let saveCompanyName = () => {
    getCompanyName()
      .clear()
      .type('Company name');
    saveButton().click();
    getUrl().should('eq', 'http://localhost:8002/ui/my-namespaces/testns1');
  };
  let getOwnersField = () => {
    return cy.get('.pf-c-form-control.pf-c-select__toggle-typeahead');
  };
  let getDropdownItem = () => {
    return cy.get('.pf-c-select__menu-wrapper');
  };
  let clearField = () => {
    return cy.get('.pf-c-button.pf-m-plain.pf-c-select__toggle-clear').click();
  };
  let checkOwnersField = () => {
    getOwnersField()
      .click()
      .type('abcde');
    getDropdownItem().should('contain', 'Not found');
    clearField();
    getDropdownItem().click();
    saveButton().click();
  };
  let getLogoField = () => {
    return cy.get('#avatar_url');
  };

  let checkLogoField = () => {
    getLogoField()
      .clear()
      .type('abcde');
    saveButton().click();
    cy.get('#avatar_url-helper').should('have.text', 'Enter a valid URL.');
    getLogoField()
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
  };
  let getDescField = () => {
    return cy.get('#description');
  };

  let descHelper = () => {
    return cy.get('#description-helper');
  };

  let checkDescField = () => {
    getDescField().type(`
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas magna velit, tempor at interdum viverra, egestas quis libero. Aenean arcu magna, sodales ut dictum accumsan, consectetur vitae mi. Maecenas efficitur ipsum a orci condimentum, in lobortis turpis accumsan. Vivamus non libero varius, vulputate nunc vitae, posuere risus. In ut malesuada magna. Cras ac rhoncus mi. Nulla tempus semper interdum. Aliquam scelerisque, purus quis vestibulum finibus, dolor augue dictum erat, id commodo justo quam non metus.`);
    saveButton().click();
    descHelper().should(
      'have.text',
      'Ensure this field has no more than 256 characters.',
    );
    getDescField()
      .clear()
      .type('A namespace description');
    saveButton().click();
    cy.get('.header-bottom').should('contain', 'A namespace description');
  };

  let getLinkTextField = () => {
    return cy.get('.link-text').click();
  };
  let getUrlField = () => {
    return cy.get('div.useful-links div.link-url #url').click();
  };
  let linksHelper = () => {
    return cy.get('#links-helper');
  };
  let checkLink = () => {
    cy.get('div.link > a')
      .should('contain', "Link to example website")
      .and('have.attr', 'href', 'https://example.com/');
  };

  let checkLinksField = () => {
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
    getLinkTextField().type("Link to example website");
    getUrlField().clear();
    saveButton().click();
    linksHelper().should('contain', 'URL: This field may not be blank.');
    getUrlField().type('example.com');
    saveButton().click();
    linksHelper().should(
      'contain',
      "URL: 'example.com' is not a valid url.",
    );
    getUrlField()
      .clear()
      .type('https://example.com/');
    saveButton().click();
    checkLink();
  };

  let trashButton = () => {
    return cy.get(
      'div.useful-links:first-child > div.link-button > div.link-container > svg > path[d^=M432]',
    );
  };

  let removeLink = () => {
    trashButton().click();
    saveButton().click();
  };

  let getEditTab = () => {
    return cy
      .get(
        'ul.pf-c-tabs__list > li.pf-c-tabs__item > button > span.pf-c-tabs__item-text',
      )
      .contains('Edit resources')
      .click();
  };

  getTextField = () => {
    return cy.get('div.pf-c-form__group-control > textarea.pf-c-form-control');
  };
  let editReadme = () => {
    getEditTab();
    getTextField()
      .invoke('attr', 'placeholder')
      .should(
        'contain',
        '## Custom resources\n\nYou can use this page to add any resources which you think might help your users automate all the things.',
      );
    getTextField()
      .click()
      .type('Editing the readme file');
    saveButton().click();
    kebabToggle();
    editNamespace();
    getEditTab();
    getTextField().should('contain', 'Editing the readme file');
  };

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.login(adminUsername, adminPassword);
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    createNamespace();
    cy.menuGo('Collections > Namespaces');
    viewNamespaceDetail();
    kebabToggle();
    editNamespace();
  });

  it('tests that the name field is disabled from editing', () => {
    checkName();
  });
  it('tests the company name for errors', () => {
    checkCompanyName();
  });
  it('saves a new company name', () => {
    saveCompanyName();
    cy.get('.pf-c-title').should('contain', 'Company name');
  });
  it('tests the namespace owners field', () => {
    checkOwnersField();
  });
  it('tests the Logo URL field', () => {
    checkLogoField();
  });
  it('tests the Description field', () => {
    checkDescField();
  });
  it('tests the Links field', () => {
    checkLinksField();
  });
  it('removes a link', () => {
    removeLink();
  });
  it('edits namespace resources', () => {
    editReadme();
  });
});
