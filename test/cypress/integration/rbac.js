const adminUsername = Cypress.env('username');
const adminPassword = Cypress.env('password');

const userName = 'testUser';
const userPassword = 'I am a complicated passw0rd';

const groupName = 'testgroup';

describe('RBAC test for user without permissions', () => {
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
  });

  beforeEach(() => {
    cy.login(userName, userPassword);
  });

  it('should not let create, edit and delete namespace when user does not have permissions', () => {
    cy.visit('/ui/namespaces');
    cy.contains('Create').should('not.exist');
    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/repo/published/testspace');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').should('not.exist');
  });

  it('should not let delete collection when user does not have permissions', () => {
    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.get('[data-cy=kebab-toggle]').should('not.exist');
  });

  it('should not display user list when user does not have permissions', () => {
    cy.visit('/ui/users');
    cy.contains('You do not have access to Automation Hub');
  });

  it('should not display group list when user does not have permissions', () => {
    cy.visit('/ui/group-list');
    cy.contains('You do not have access to Automation Hub');
  });

  it('should not display EE list, edit or delete container when user does not have permissions', () => {
    cy.visit('/ui/containers/testcontainer');
    cy.get('[data-cy=edit-container]').should('not.exist');
    cy.visit('/ui/containers');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });

  it('should not be able to create remote registries, edit or delete when user does not have permissions', () => {
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('not.exist');
    cy.get('[aria-label=registry-list-kebab]').click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');
  });
});

describe('RBAC test for user with all permissions', () => {
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
    cy.addAllPermissions(groupName);
    cy.addUserToGroup(groupName, userName);
  });

  beforeEach(() => {
    cy.login(userName, userPassword);
  });

  it('should display create, edit and delete buttons in namespace when user has permissions', () => {
    cy.visit('/ui/namespaces');
    cy.contains('Create').should('exist');
    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/repo/published/testspace');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').should('exist').click();
    cy.contains('Edit namespace');
    cy.contains('Delete namespace');
  });

  it('should let delete collection when user has permissions', () => {
    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit('/ui/repo/published/testspace/testcollection');
    cy.get('[data-cy=kebab-toggle]').should('exist').click();
    cy.contains('Delete entire collection');
  });

  it('should display list of users when user has permissions', () => {
    cy.visit('/ui/users');
    cy.contains('Users');
  });

  it('should display list of groups when user has permissions', () => {
    cy.visit('/ui/group-list');
    cy.contains('Groups');
  });

  it('should display edit and delete buttons when user has permissions', () => {
    cy.visit('/ui/containers/testcontainer');
    cy.get('[data-cy=edit-container]').should('exist');
    cy.visit('/ui/containers');
    cy.get('[data-cy=kebab-toggle] > .pf-c-dropdown').click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });

  it('should display create, edit and delete buttons when user has permissions', () => {
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('exist');
    cy.get('[aria-label=registry-list-kebab]').click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });
});
