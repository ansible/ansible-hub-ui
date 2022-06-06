import allPerms from '../support/permissions';

const adminUsername = Cypress.env('username');
const adminPassword = Cypress.env('password');

const userName = 'testUser';
const userPassword = 'I am a complicated passw0rd';

const groupName = 'testgroup';

const addRoleToGroupAndSwitchUser = (role) => {
  cy.login(adminUsername, adminPassword);
  cy.addRolesToGroup(groupName, [role]);
  cy.login(userName, userPassword);
};

describe('RBAC test for user without permissions', () => {
  before(() => {
    cy.login(adminUsername, adminPassword);

    cy.galaxykit(
      'registry create',
      'docker',
      'https://registry.hub.docker.com/',
    );
    cy.galaxykit(
      'container create',
      `testcontainer`,
      'library/alpine',
      `docker`,
    );
    cy.galaxykit('user create', userName, userPassword);
    cy.galaxykit('group create', groupName);
    cy.galaxykit('user group add', userName, groupName);

    cy.galaxykit('-i namespace create', 'testspace');
    cy.galaxykit('-i collection upload testspace testcollection');
  });

  after(() => {
    cy.login(adminUsername, adminPassword);
    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteNamespacesAndCollections();
  });

  beforeEach(() => {
    cy.login(userName, userPassword);
  });

  it("shouldn't display create, edit and delete buttons in namespace when user doesn't have permission", () => {
    cy.visit('/ui/namespaces');

    // cannot Add namespace
    cy.contains('Create').should('not.exist');

    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/repo/published/testspace');

    // cannot Change namespace and Delete namespace
    cy.get('[data-cy=kebab-toggle]').should('not.exist');

    // cannot Upload to namespace
    cy.contains('Upload collection').should('not.exist');
  });

  it("shouldn't let delete collection and modify ansible repo content when user doesn't have permission", () => {
    cy.visit('/ui/repo/published/testspace/testcollection');

    // cannot Delete collection
    cy.get('[data-cy=kebab-toggle]').should('not.exist');

    // cannot Modify Ansible repo content
    // ???
  });

  it("shouldn't let view, add, change and delete users when user doesn't have permission", () => {
    // cannot View user
    cy.menuMissing('User Access > Users');
    cy.visit('/ui/users');
    cy.contains('You do not have access to Automation Hub');

    // cannot Add user
    cy.contains('Create').should('not.exist');
    cy.visit('/ui/users/create');
    cy.contains('You do not have access to Automation Hub');

    // cannot Change and Delete user
    cy.visit('/ui/users');
    cy.get('[data-cy="UserList-row-testUser"] [data-cy=kebab-toggle]').should(
      'not.exist',
    );
  });

  it("shouldn't let view, add, change and delete groups when user doesn't have permission", () => {
    // cannot View group
    cy.menuMissing('User Access > Groups');
    cy.visit('/ui/group-list');
    cy.contains('You do not have access to Automation Hub');

    // cannot Add group
    cy.contains('Create').should('not.exist');

    // cannot Change and Delete group
    cy.get('[data-cy="GroupList-row-testgroup"]').should('not.exist');
  });

  it("shouldn't let create, edit or delete container when user doesn't have permission", () => {
    cy.visit('/ui/containers');

    // cannot Create new containers
    //FIXME create containers: this will fail after SAVE in modal without permissions
    // hide button or make it disabled like in other pages if no permissions?
    // solution:
    // cy.contains('Add execution environment').should('not.exist');

    // cannot Change and Delete container
    cy.get(
      '[data-cy="ExecutionEnvironmentList-row-testcontainer"] [data-cy="kebab-toggle"]',
    ).click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');

    cy.visit('/ui/containers/testcontainer');
    cy.contains('Edit').should('not.exist');
    cy.get('[aria-label="Actions"]').click();
    cy.contains('Delete').should('not.exist');

    // temporary solution (button should not be visible, if user has no permissions to sync it)
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Sync failed for testcontainer',
    );

    // can Change container namespace permissions

    // can Change image tags

    // can Push to existing containers
  });

  it("shouldn't let add, delete and sync remote registries when user doesn't have permission", () => {
    // can Add remote registry
    // in here we hide the button (correct), but in containers we dont (wrong)
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('not.exist');

    // can Change and Delete remote registry
    cy.get('[data-cy="kebab-toggle"]').click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');

    // cannot sync remote registry
    //FIXME sync remote registry (change remote registry): should this buttons be shown if no permissions?
    // If user has no permissions this will show alert error
    // solution would be hiding the sync button if no permissions
    // solution:
    // cy.contains('Sync from registry').should('not.exist');

    // current workaround
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Remote registry "docker" could not be synced.',
    );
  });

  it("shouldn't let view all tasks, change and delete task when user doesn't have permission", () => {
    // cannot View all tasks
    //FIXME: task permissions are currently not implemented, but we have roles for them?
    // solution:
    // cy.menuMissing('Task Management');
    // cy.visit('/ui/tasks');
    // cy.contains('You do not have permission to perform this action.')
    // actions not supported in UI
    // can Change task
    // can Delete task
  });
});

describe('RBAC test for user with permissions', () => {
  before(() => {
    cy.login(adminUsername, adminPassword);

    cy.galaxykit(
      'registry create',
      'docker',
      'https://registry.hub.docker.com/',
    );
    cy.addRemoteContainer({
      name: `testcontainer`,
      upstream_name: 'library/alpine',
      registry: `docker`,
      include_tags: 'latest',
    });

    cy.galaxykit('user create', userName, userPassword);
    cy.galaxykit('group create', groupName);
    cy.galaxykit('user group add', userName, groupName);

    allPerms.forEach((perm) => {
      cy.createRole(
        `galaxy.test_${perm.group}`,
        `role with ${perm.group} perms`,
        [perm],
      );
    });
  });

  after(() => {
    cy.login(adminUsername, adminPassword);
    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteNamespacesAndCollections();

    // delete roles manually
    cy.intercept('GET', Cypress.env('pulpPrefix') + 'roles/*').as('roles');

    cy.visit('/ui/roles');

    cy.wait('@roles').then((result) => {
      const data = result.response.body.results;
      data.forEach(({ name }) => {
        name.includes('galaxy.test_') && cy.deleteRole(name);
      });
    });
  });

  it('should display create, edit and delete buttons in namespace when user has permissions', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_namespaces');

    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit('/ui/namespaces');

    // can Add namespace
    cy.contains('Create').should('exist');
    cy.galaxykit('-i namespace create', 'testspace');

    cy.visit('/ui/repo/published/testspace');
    cy.get('[data-cy="ns-kebab-toggle"]').should('exist').click();
    cy.contains('Edit namespace');
    cy.contains('Delete namespace');

    // can Upload to namespace
    cy.contains('Upload collection').should('exist');
  });

  it('should let delete collection and modify ansible repo content when user has permissions', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_collections');

    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit('/ui/repo/published/testspace/testcollection');

    // can Delete collection
    cy.get('[data-cy=kebab-toggle]').should('exist').click();
    cy.contains('Delete entire collection');

    // can Modify Ansible repo content
    // ???
  });

  it('should let view, add, change and delete users when user has permissions', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_users');

    // can View user
    cy.menuPresent('User Access > Users');
    cy.visit('/ui/users');
    cy.contains('Users');

    // can Add user
    cy.contains('Create');
    cy.visit('/ui/users/create');
    cy.contains('Create new user');

    // can Change and Delete user
    cy.visit('/ui/users');
    cy.get(
      '[data-cy="UserList-row-testUser"] [data-cy=kebab-toggle] > .pf-c-dropdown',
    ).click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });

  it('should let view, add, change and delete groups when user has permissions', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_groups');

    // can View group
    cy.menuPresent('User Access > Groups');
    cy.visit('/ui/group-list');
    cy.contains('Groups');

    // can Add group
    cy.contains('Create').should('exist');

    // can Change and Delete group
    cy.get(
      '[data-cy="GroupList-row-testgroup"] [data-cy=kebab-toggle] > .pf-c-dropdown',
    ).click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });

  it('should let create, edit or delete container when user has permission', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_containers');

    cy.visit('/ui/containers');

    // can Create new containers
    //FIXME create containers:
    // cy.contains('Add execution environment').should('exist');

    // can Change and Delete container
    cy.get(
      '[data-cy="ExecutionEnvironmentList-row-testcontainer"] [data-cy="kebab-toggle"]',
    ).click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');

    cy.visit('/ui/containers/testcontainer');
    cy.contains('Edit').should('exist');
    cy.get('[aria-label="Actions"]').click();
    cy.contains('Delete').should('exist');
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Sync started for remote registry "testcontainer".',
    );

    // can Change container namespace permissions

    // can Change image tags

    // can Push to existing containers
  });

  it('should let add, delete and sync remote registries when user has permission', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_registries');

    // can Add remote registry
    cy.visit('/ui/registries');
    cy.contains('Add remote registry').should('exist');

    // can Change and Delete remote registry
    cy.get('[data-cy="kebab-toggle"]').click();
    cy.contains('Edit');
    cy.contains('Delete');

    // can sync remote registry
    //FIXME sync remote registry (change remote registry): already mention above
    // current workaround
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Sync started for remote registry "docker".',
    );
  });

  it('should let view all tasks, change and delete task when user has permission', () => {
    addRoleToGroupAndSwitchUser('galaxy.test_task_management');

    // can View all tasks
    cy.menuPresent('Task Management');
    cy.visit('/ui/tasks');
    cy.contains('Task Management');

    // not supported in our UI
    // can Change task
    // can Delete task
  });
});
