describe('Repo Management tests', () => {
  let remoteRepoUrl = '/ui/repositories?tab=remote';
  let localRepoUrl = '/ui/repositories';

  beforeEach(() => {
    cy.login();
  });

  it('admin user sees download_concurrency in remote config', () => {
    cy.visit(remoteRepoUrl);
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('#download_concurrency').should('exist');
  });

  it('can see table in repo tabs and it shows data correctly', () => {
    cy.visit(localRepoUrl);
    cy.get('[data-cy="SortTable-headers"]').contains('Distribution name');
    cy.get('[data-cy="SortTable-headers"]').contains('Repository name');
    cy.get('[data-cy="SortTable-headers"]').contains('Content count');
    cy.get('[data-cy="SortTable-headers"]').contains('Last updated');
    cy.get('[data-cy="SortTable-headers"]').contains('Repo URL');
    cy.get('[data-cy="SortTable-headers"]').contains('CLI configuration');
    cy.contains('community');
    cy.contains('published');
    cy.contains('rejected');
    cy.contains('rh-certified');
    cy.contains('staging');
    cy.get('button').contains('Remote').parent().click();
    cy.get('[data-cy="SortTable-headers"]').contains('Remote name');
    cy.get('[data-cy="SortTable-headers"]').contains('Repositories');
    cy.get('[data-cy="SortTable-headers"]').contains('Last updated');
    cy.get('[data-cy="SortTable-headers"]').contains('Last sync');
    cy.get('[data-cy="SortTable-headers"]').contains('Sync status');

    cy.contains('Configure');
    cy.contains('Sync');
  });

  /* FIXME: Needs more work to handle uploading a requirements.yml
   * when you want to save the remote proxy config.
   */
  it.skip('remote proxy config can be saved and deleted.', () => {
    cy.login();
    cy.visit(remoteRepoUrl);
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();

    // first fill it up with data
    cy.get('input[id="username"]').type('test');
    cy.get('input[id="password"]').type('test');
    cy.get('input[id="proxy_url"]').type('https://example.org');
    cy.get('input[id="proxy_username"]').type('test');
    cy.get('input[id="proxy_password"]').type('test');
    cy.intercept(
      'PUT',
      Cypress.env('prefix') + 'content/community/v3/sync/config/',
    ).as('saveConfig');
    cy.contains('Save').click();
    cy.wait('@saveConfig').its('status').should('eq', 200);

    // verify values have been saved properly.
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', 'test');
    cy.get('input[id="proxy_url"]').should('have.value', 'https://example.org');
    cy.get('input[id="proxy_username"]').should('have.value', 'test');

    // clear the values
    cy.get('input[id="username"]').clear();
    cy.get('input[type="password"]')
      .siblings('button')
      .click({ multiple: true });
    cy.get('input[id="proxy_url"]').clear();
    cy.get('input[id="proxy_username"]').clear();
    cy.contains('Save').click();
    cy.wait('@saveConfig').its('status').should('eq', 200);

    // verify the values have been deleted
    cy.get('[aria-label="Actions"]:first').click(); // click the kebab menu on the 'community' repo
    cy.contains('Edit').click();
    cy.contains('Show advanced options').click();
    cy.get('input[id="username"]').should('have.value', '');
    cy.get('input[id="password"]').should('have.value', '');
    cy.get('input[id="proxy_url"]').should('have.value', '');
    cy.get('input[id="proxy_password"]').should('have.value', '');
  });
});
