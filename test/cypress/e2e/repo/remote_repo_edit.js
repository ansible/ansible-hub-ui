const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');

describe('edit a remote repository', () => {
  let remoteRepoUrl = `${uiPrefix}repositories?tab=remote`;

  beforeEach(() => {
    cy.login();
  });

  it(`edits remote repo 'community'`, () => {
    cy.visit(remoteRepoUrl);
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.get('input[id="name"]').should('be.disabled'); //has a readonly name field
    cy.get('input[id="url"]').clear();
    cy.get('button').contains('Save').should('be.disabled'); // Save button disabled when required fields are missing
    cy.get('[id="url-helper"]').should(
      'have.text',
      `The URL needs to be in 'http(s)://' format.`,
    );

    cy.contains('Show advanced options').click();

    // enter new values
    cy.get('input[id="url"]').type('https://galaxy.ansible.com/api/');
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
    cy.intercept('PUT', `${apiPrefix}content/community/v3/sync/config/`).as(
      'editCommunityRemote',
    );
    cy.contains('Save').click();
    cy.wait('@editCommunityRemote');

    // verify values have been saved properly.
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();

    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', 'test');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('input[id="proxy_username"]').should('have.value', 'test');
    cy.contains('Save').click();
    cy.wait('@editCommunityRemote');

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
    cy.wait('@editCommunityRemote');

    //check for clear values
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('be.empty');
    cy.get('input[id="password"]').should('be.empty');
    cy.get('input[id="proxy_url"]').should('be.empty');
    cy.get('input[id="proxy_username"]').should('be.empty');
    cy.contains('Save').click();
    cy.wait('@editCommunityRemote');
  });

  it(`edits remote repo 'rh-certified'`, () => {
    cy.visit(remoteRepoUrl);
    cy.get('[data-cy="kebab-toggle"]').should('be.visible');
    cy.get('[data-cy="kebab-toggle"]').eq(1).click(); // click the kebab menu on the 'rh-certified' repo
    cy.contains('Edit').click();
    cy.get('input[id="name"]').should('be.disabled'); //has a readonly name field
    cy.get('input[id="url"]').clear();
    cy.get('button').contains('Save').should('be.disabled'); // Save button disabled when required fields are missing
    cy.get('[id="url-helper"]').should(
      'have.text',
      `The URL needs to be in 'http(s)://' format.`,
    );
    cy.contains('Show advanced options').click();
    // enter new values
    cy.get('input[id="url"]').type(
      'https://cloud.redhat.com/api/automation-hub/',
    );
    cy.get('input[id="username"]').type('test');
    cy.get('input[id="password"]').type('test');

    cy.get('input[id="proxy_url"]').type('https://example.org');
    cy.get('input[id="proxy_username"]').type('test');
    cy.get('input[id="proxy_password"]').type('test');
    cy.intercept('PUT', `${apiPrefix}content/rh-certified/v3/sync/config/`).as(
      'editRemote',
    );
    cy.contains('Save').click();
    cy.wait('@editRemote');

    // verify values have been saved properly.
    cy.get('[aria-label="Actions"]').should('be.visible');
    cy.get('[aria-label="Actions"]').eq(1).click(); // click the kebab menu on the 'rh-certified' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', 'test');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('input[id="proxy_username"]').should('have.value', 'test');
    cy.intercept('PUT', `${apiPrefix}content/community/v3/sync/config/`).as(
      'editRemote',
    );
    cy.contains('Save').click();
    cy.wait('@editRemote');

    // clear all values
    cy.get('[aria-label="Actions"]').should('be.visible');
    cy.get('[aria-label="Actions"]').eq(1).click(); // click the kebab menu on the 'rh-certified' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').clear();
    cy.get('input[type="password"]')
      .siblings('button')
      .click({ multiple: true });
    cy.get('input[id="proxy_url"]').clear();
    cy.get('input[id="proxy_username"]').clear();
    cy.contains('Save').click();
    cy.wait('@editRemote');

    //check for clear values
    cy.get('[aria-label="Actions"]').eq(1).click(); // click the kebab menu on the 'rh-certified' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('be.empty');
    cy.get('input[id="password"]').should('be.empty');
    cy.get('input[id="proxy_url"]').should('be.empty');
    cy.get('input[id="proxy_username"]').should('be.empty');
    cy.contains('Save').click();
    cy.wait('@editRemote');
  });
});
