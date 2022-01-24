describe('RBAC permissions test', () => {
  const adminUsername = Cypress.env('username');
  const adminPassword = Cypress.env('password');

  const userName = 'testUser';
  const userPassword = 'I am a complicated passw0rd';

  const groupName = 'testgroup';

  before(() => {
    cy.login(adminUsername, adminPassword);

    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteRegistries();
    cy.deleteContainers();

    cy.addRemoteRegistry(`docker`, 'https://registry.hub.docker.com/');
    cy.addRemoteContainer({
      name: `testcontainer`,
      upstream_name: 'library/alpine',
      registry: `docker`,
      include_tags: 'latest',
    });

    cy.createUser(userName, userPassword);
    cy.createGroup(groupName);
    cy.addUserToGroup(groupName, userName);
  });

  it('test if user has no permissions', () => {
    cy.login(userName, userPassword);

    // namespace
    cy.visit('/ui/namespaces');
    cy.contains('Create').should('not.exist');
    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/repo/published/testspace');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').should('not.exist');

    // collections
    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.get('[data-cy=kebab-toggle]').should('not.exist');

    // users
    cy.visit('/ui/users');
    cy.contains('You do not have access to Automation Hub');

    // groups
    cy.visit('/ui/group-list');
    cy.contains('You do not have access to Automation Hub');

    // containers
    cy.visit('/ui/containers/testcontainer');
    cy.get('[data-cy=edit-container]').should('not.exist');

    cy.visit('/ui/containers');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');

    // remote registries
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('not.exist');
    cy.get('[aria-label=registry-list-kebab]').click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });

  it('add all permissions to group and test it', () => {
    cy.login(adminUsername, adminPassword);
    cy.addAllPermissions(groupName);
    cy.login(userName, userPassword);

    // namespace
    cy.visit('/ui/namespaces');
    cy.contains('Create').should('exist');
    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/repo/published/testspace');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').should('exist').click();
    cy.contains('Edit namespace');
    cy.contains('Delete namespace');

    // collections
    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.get('[data-cy=kebab-toggle]').should('exist').click();
    cy.contains('Delete entire collection');

    // users
    cy.visit('/ui/users');
    cy.contains('Users');

    // groups
    cy.visit('/ui/group-list');
    cy.contains('Groups');

    // containers
    cy.visit('/ui/containers/testcontainer');
    cy.get('[data-cy=edit-container]').should('not.exist');
    cy.visit('/ui/containers');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');

    // remote registries
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('exist');
    cy.get('[aria-label=registry-list-kebab]').click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });
});
