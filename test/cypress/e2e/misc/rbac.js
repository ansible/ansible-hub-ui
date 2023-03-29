const uiPrefix = Cypress.env('uiPrefix');

const userName = 'testUser';
const userPassword = 'I am a complicated passw0rd';

const groupName = 'testgroup';

describe('RBAC test for user without permissions', () => {
  before(() => {
    cy.login();

    cy.galaxykit(
      '-i registry create',
      'docker',
      'https://registry.hub.docker.com/',
    );

    cy.galaxykit(
      '-i container create',
      `testcontainer`,
      'library/alpine',
      `docker`,
    );

    cy.galaxykit('-i user create', userName, userPassword);
    cy.galaxykit('-i group create', groupName);
    cy.galaxykit('-i user group add', userName, groupName);

    cy.galaxykit('-i namespace create', 'testspace');
    cy.galaxykit('-i collection upload testspace testcollection');
  });

  after(() => {
    cy.login();

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
    cy.visit(`${uiPrefix}namespaces`);

    // cannot Add namespace
    cy.contains('Create').should('not.exist');

    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit(`${uiPrefix}namespaces/testspace`);

    // cannot Change namespace and Delete namespace
    cy.get('[data-cy=kebab-toggle]').should('not.exist');

    // cannot Upload to namespace
    cy.contains('Upload collection').should('not.exist');
  });

  it("shouldn't let delete collection and modify ansible repo content when user doesn't have permission", () => {
    cy.visit(`${uiPrefix}repo/published/testspace/testcollection`);

    // cannot Delete collection
    cy.get('[data-cy=kebab-toggle]').should('not.exist');
  });

  it("shouldn't let view, add, change and delete users when user doesn't have permission", () => {
    // cannot View user
    cy.menuMissing('User Access > Users');
    cy.visit(`${uiPrefix}users`);
    cy.contains('You do not have access to Automation Hub');

    // cannot Add user
    cy.contains('Create').should('not.exist');
    cy.visit(`${uiPrefix}users/create`);
    cy.contains('You do not have access to Automation Hub');

    // cannot Change and Delete user
    cy.visit(`${uiPrefix}users`);
    cy.get('[data-cy="UserList-row-testUser"] [data-cy=kebab-toggle]').should(
      'not.exist',
    );
  });

  it("shouldn't let view, add, change and delete groups when user doesn't have permission", () => {
    // cannot View group
    cy.menuMissing('User Access > Groups');
    cy.visit(`${uiPrefix}group-list`);
    cy.contains('You do not have access to Automation Hub');

    // cannot Add group
    cy.contains('Create').should('not.exist');

    // cannot Change and Delete group
    cy.get('[data-cy="GroupList-row-testgroup"]').should('not.exist');
  });

  it("shouldn't let create, edit or delete container when user doesn't have permission", () => {
    cy.visit(`${uiPrefix}containers`);

    // cannot Create new containers
    cy.contains('Add execution environment').should('not.exist');

    // cannot Change and Delete container
    cy.get(
      '[data-cy="ExecutionEnvironmentList-row-testcontainer"] [data-cy="kebab-toggle"]',
    ).click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');

    cy.visit(`${uiPrefix}containers/testcontainer`);
    cy.contains('Edit').should('not.exist');
    cy.get('[aria-label="Actions"]').click();
    cy.contains('Delete').should('not.exist');

    // temporary solution (button should not be visible, if user has no permissions to sync it)
    cy.contains('Sync from registry').should('not.exist');
  });

  it("shouldn't let add, delete and sync remote registries when user doesn't have permission", () => {
    // can Add remote registry
    // in here we hide the button (correct), but in containers we dont (wrong)
    cy.visit(`${uiPrefix}registries`);
    cy.contains('Add remote registry').should('not.exist');

    // can Change and Delete remote registry
    cy.get(
      '[data-cy="ExecutionEnvironmentRegistryList-row-docker"] [data-cy="kebab-toggle"]',
    ).click();
    cy.contains('Edit').should('not.exist');
    cy.contains('Delete').should('not.exist');

    // cannot sync remote registry
    cy.contains('Sync from registry').should('not.exist');
  });

  it("shouldn't let view all tasks, change and delete task when user doesn't have permission", () => {
    cy.visit(`${uiPrefix}tasks`);

    cy.get('[aria-label="Task list"] tr td a').first().click();

    cy.contains('404 - Page not found');
  });
});

describe('RBAC test for user with permissions', () => {
  const allPerms = [
    {
      group: 'namespaces',
      permissions: [
        'galaxy.add_namespace',
        'galaxy.change_namespace',
        'galaxy.delete_namespace',
        'galaxy.upload_to_namespace',
      ],
    },
    {
      group: 'collections',
      permissions: [
        'ansible.modify_ansible_repo_content',
        'ansible.delete_collection',
      ],
    },
    {
      group: 'users',
      permissions: [
        'galaxy.view_user',
        'galaxy.delete_user',
        'galaxy.add_user',
        'galaxy.change_user',
      ],
    },
    {
      group: 'groups',
      permissions: [
        'galaxy.view_group',
        'galaxy.delete_group',
        'galaxy.add_group',
        'galaxy.change_group',
      ],
    },
    {
      group: 'remotes',
      permissions: [
        'ansible.change_collectionremote',
        'ansible.view_collectionremote',
      ],
    },
    {
      group: 'containers',
      permissions: [
        'container.delete_containerrepository',
        'container.change_containernamespace',
        'container.namespace_change_containerdistribution',
        'container.namespace_modify_content_containerpushrepository',
        'container.add_containernamespace',
        'container.namespace_push_containerdistribution',
      ],
    },
    {
      group: 'registries',
      permissions: [
        'galaxy.add_containerregistryremote',
        'galaxy.change_containerregistryremote',
        'galaxy.delete_containerregistryremote',
      ],
    },
    {
      group: 'task_management',
      permissions: ['core.view_task', 'core.delete_task', 'core.change_task'],
    },
  ];

  before(() => {
    cy.login();

    cy.galaxykit(
      '-i registry create',
      'docker',
      'https://registry.hub.docker.com/',
    );
    cy.addRemoteContainer({
      name: `testcontainer`,
      upstream_name: 'library/alpine',
      registry: `docker`,
      include_tags: 'latest',
    });

    cy.galaxykit('-i user create', userName, userPassword);
    cy.galaxykit('-i group create', groupName);
    cy.galaxykit('-i user group add', userName, groupName);

    allPerms.forEach((perm) => {
      cy.createRole(
        `galaxy.test_${perm.group}`,
        `role with ${perm.group} perms`,
        perm.permissions,
        true,
      );
    });
  });

  after(() => {
    cy.login();

    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteNamespacesAndCollections();

    allPerms.forEach(({ group }) => {
      cy.galaxykit('-i role delete', group);
    });
  });

  it('should display create, edit and delete buttons in namespace when user has permissions', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_namespaces');
    cy.login(userName, userPassword);

    cy.galaxykit('-i namespace create', 'testspace');
    cy.visit(`${uiPrefix}namespaces`);

    // can Add namespace
    cy.contains('Create').should('exist');
    cy.galaxykit('-i namespace create', 'testspace');

    cy.visit(`${uiPrefix}namespaces/testspace`);
    cy.get('[data-cy="ns-kebab-toggle"]').should('exist').click();
    cy.contains('Edit namespace');
    cy.contains('Delete namespace');

    // can Upload to namespace
    cy.contains('Upload collection').should('exist');
  });

  it('should let delete collection and modify ansible repo content when user has permissions', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_collections');
    cy.login(userName, userPassword);

    cy.galaxykit('-i collection upload testspace testcollection');
    cy.visit(`${uiPrefix}repo/published/testspace/testcollection`);

    // can Delete collection
    cy.get('[data-cy=kebab-toggle]').should('exist').click();
    cy.contains('Delete entire collection');
  });

  it('should let view, add, change and delete users when user has permissions', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_users');
    cy.login(userName, userPassword);

    // can View user
    cy.menuPresent('User Access > Users');
    cy.visit(`${uiPrefix}users`);
    cy.contains('Users');

    // can Add user
    cy.contains('Create');
    cy.visit(`${uiPrefix}users/create`);
    cy.contains('Create new user');

    // can Change and Delete user
    cy.visit(`${uiPrefix}users`);
    cy.get(
      '[data-cy="UserList-row-testUser"] [data-cy=kebab-toggle] > .pf-c-dropdown',
    ).click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');
  });

  it('should let view, add, change and delete groups when user has permissions', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_groups');
    cy.login(userName, userPassword);

    // can View group
    cy.menuPresent('User Access > Groups');
    cy.visit(`${uiPrefix}group-list`);
    cy.contains('Groups');

    // can Add group
    cy.contains('Create').should('exist');

    // can Change and Delete group
    cy.get(
      '[data-cy="GroupList-row-testgroup"] [data-cy=kebab-toggle] > .pf-c-dropdown',
    ).click();
    cy.contains('Delete').should('exist');
  });

  it('should let create, edit or delete container when user has permission', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_containers');
    cy.login(userName, userPassword);

    cy.visit(`${uiPrefix}containers`);

    // can Create new containers
    cy.contains('Add execution environment').should('exist');

    // can Change and Delete container
    cy.get(
      '[data-cy="ExecutionEnvironmentList-row-testcontainer"] [data-cy="kebab-toggle"]',
    ).click();
    cy.contains('Edit').should('exist');
    cy.contains('Delete').should('exist');

    cy.visit(`${uiPrefix}containers/testcontainer`);
    cy.contains('Edit').should('exist');
    cy.get('[aria-label="Actions"]').click();
    cy.contains('Delete').should('exist');
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Sync started for remote registry "testcontainer".',
    );
  });

  it('should let add, delete and sync remote registries when user has permission', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_registries');
    cy.login(userName, userPassword);

    // can Add remote registry
    cy.visit(`${uiPrefix}registries`);
    cy.contains('Add remote registry').should('exist');

    // can Change and Delete remote registry
    cy.get('[data-cy="kebab-toggle"]').click();
    cy.contains('Edit');
    cy.contains('Delete');

    // can sync remote registry
    cy.contains('Sync from registry').click();
    cy.get('[data-cy="AlertList"] .pf-c-alert__title').contains(
      'Sync started for remote registry "docker".',
    );
  });

  it('should let view all tasks, change and delete task when user has permission', () => {
    cy.galaxykit('-i group role add', groupName, 'galaxy.test_task_management');
    cy.login(userName, userPassword);

    cy.visit(`${uiPrefix}tasks`);
    cy.get('[aria-label="Task list"] tr td a').first().click();
    cy.contains('Task detail');
  });
});
