describe('edit a remote repository', () => {
  let remoteRepoUrl = '/ui/repositories?tab=remote';

  beforeEach(() => {
    cy.login();
  });

  it(`edits remote repo 'community'`, () => {
    cy.visit(remoteRepoUrl);
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.get('input[id="name"]').should('be.disabled'); //has a readonly name field
    cy.contains('Show advanced options').click(); // advanced options button is working

    // enter new values
    cy.get('input[id="username"]').type('test');
    cy.get('input[id="password"]').type('test');
    cy.get('input[id="proxy_url"]').type('https://example.org');
    cy.get('input[id="proxy_username"]').type('test');
    cy.get('input[id="proxy_password"]').type('test');
    cy.fixture('/yaml/test.yaml')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'test.yaml',
        });
      });
    cy.intercept(
      'PUT',
      Cypress.env('prefix') + 'content/community/v3/sync/config/',
    ).as('editCommunityRemote');
    cy.contains('Save').click();
    cy.wait('@editCommunityRemote');

    // verify values have been saved properly.
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();

    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', 'test');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('input[id="proxy_username"]').should('have.value', 'test');
    cy.intercept(
      'PUT',
      Cypress.env('prefix') + 'content/community/v3/sync/config/',
    ).as('editRemote');
    cy.contains('Save').click();
    cy.wait('@editRemote');

    // clear all values
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').clear();
    cy.get('input[type="password"]')
      .siblings('button')
      .click({ multiple: true });
    cy.get('input[id="proxy_url"]').clear();
    cy.get('input[id="proxy_username"]').clear();
    cy.contains('Save').click();
  });

  it(`edits remote repo 'rh-certified'`, () => {
    cy.visit(remoteRepoUrl);
    cy.get('[data-cy="kebab-toggle"]').eq(1).click(); // click the kebab menu on the 'rh-certified' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    // enter new values
    cy.get('input[id="username"]').type('test');
    cy.get('input[id="password"]').type('test');

    cy.get('input[id="proxy_url"]').type('https://example.org');
    cy.get('input[id="proxy_username"]').type('test');
    cy.get('input[id="proxy_password"]').type('test');
    cy.intercept(
      'PUT',
      Cypress.env('prefix') + 'content/rh-certified/v3/sync/config/',
    ).as('editRemote');
    cy.contains('Save').click();
    cy.wait('@editRemote');

    // verify values have been saved properly.
    cy.get('[aria-label="Actions"]').eq(1).click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', 'test');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('input[id="proxy_username"]').should('have.value', 'test');
    cy.contains('Save').click();
  });

  //requirements

  it('has Save button disabled when required fields are msising', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('has a readonly name field', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('has error messages for wrongly filled fields', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('shows and hides advanced options', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });
});
