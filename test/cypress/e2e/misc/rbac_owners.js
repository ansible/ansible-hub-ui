const uiPrefix = Cypress.env('uiPrefix');

describe('Namespace owners tab', () => {
  before(() => {
    cy.deleteNamespacesAndCollections();
    cy.deleteTestGroups();

    cy.galaxykit(`-i namespace create rbac_owners`);
    cy.galaxykit('-i group create', `owners_group`);
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}repo/published/rbac_owners`);
    cy.get('.pf-c-tabs__item-text').contains('Namespace owners').click();
  });

  it('add and remove group and roles', () => {
    testOwnersTab({
      permission: 'change_namespace',
      permissionGroup: 'Galaxy',
      permissionLabel: 'Change namespace',
      role: 'galaxy.collection_publisher',
      roleFilter: 'publish',
    });
  });
});

describe('Execution Environment Owners tab', () => {
  before(() => {
    cy.login();
    cy.deleteRegistries();
    cy.deleteContainers();
    cy.deleteTestGroups();

    cy.galaxykit('registry create', `rbac_owners_registry`, 'https://quay.io/');
    cy.galaxykit(
      'container create',
      `rbac_owners`,
      'ansible/docker-test-containers',
      `rbac_owners_registry`,
    );
    cy.galaxykit('-i group create', `owners_group`);
  });

  beforeEach(() => {
    cy.login();
    cy.visit(`${uiPrefix}containers/rbac_owners`);
    cy.get('.pf-c-tabs__item-text').contains('Owners').click();
  });

  it('add and remove group and roles', () => {
    testOwnersTab({
      permission: 'change_containernamespace',
      permissionGroup: 'Container',
      permissionLabel: 'Change container namespace permissions',
      role: 'galaxy.execution_environment_publisher',
      roleFilter: 'publish',
    });
  });
});

function testOwnersTab({
  permission,
  permissionGroup,
  permissionLabel,
  role,
  roleFilter,
}) {
  // new thing, expect no owners
  cy.get('.pf-c-empty-state');
  cy.get('button').contains('Select a group').click();

  // group role modal
  // find partner-engineers, select, check indicator, next
  cy.get('[data-cy=compound_filter] input[aria-label=name__icontains]').type(
    'owners{enter}',
  );
  cy.get(
    '[data-cy="GroupListTable-CheckboxRow-row-owners_group"] input[type=radio]',
  ).click();

  cy.get('strong').contains('Selected group');
  cy.get('.hub-permission').contains('owners_group');

  cy.get('footer button').contains('Next').click();

  // find collection_publisher, select, check indicator, next
  cy.get('[data-cy=compound_filter] input[aria-label=name__icontains]').type(
    `${roleFilter}{enter}`,
  );
  cy.get(
    `[data-cy="RoleListTable-CheckboxRow-row-${role}"] input[type=checkbox]`,
  ).click();

  cy.get('strong').contains('Selected roles');
  cy.get('.hub-permission').contains(role);

  cy.get('footer button').contains('Next').click();

  // see preview, add
  cy.get('strong').contains('owners_group');
  cy.get('strong').contains(role);

  cy.get('.hub-permission strong').contains(permissionGroup);
  cy.get('.hub-permission').contains(permission);

  cy.get('footer button').contains('Add').click();
  cy.get('.pf-c-alert__title')
    .contains(
      `Group "owners_group" has been successfully added to "rbac_owners".`,
    )
    .parent('.pf-c-alert')
    .find('button')
    .click();
  cy.get('tr[data-cy="OwnersTab-row-owners_group"]');

  // group list view, try modal, open group
  cy.get('button').contains('Select a group').click();
  cy.get('.pf-c-wizard__footer-cancel').click();

  cy.get('tr[data-cy="OwnersTab-row-owners_group"] a').click();

  // role list view, use modal
  cy.get(`[data-cy="RoleListTable-ExpandableRow-row-${role}"]`);
  cy.get('button').contains('Add roles').click();
  cy.get('.pf-c-table__check input[type=checkbox]')
    .not('[disabled]')
    .first()
    .click();
  cy.get('footer button').contains('Next').click();
  cy.get('footer button').contains('Add').click();
  cy.get('.pf-c-alert__title')
    .contains(
      `Group "owners_group" roles successfully updated in "rbac_owners".`,
    )
    .parent('.pf-c-alert')
    .find('button')
    .click();

  // role list view, expand
  cy.get('tbody[role=rowgroup]').should('have.length', 2);
  cy.get(
    `[data-cy="RoleListTable-ExpandableRow-row-${role}"] .pf-c-table__toggle button`,
  ).click();
  cy.contains('.pf-c-label', permissionLabel, { timeout: 10000 });

  // role list view, remove
  cy.get(
    `[data-cy="RoleListTable-ExpandableRow-row-${role}"] [data-cy=kebab-toggle] button`,
  ).click();
  cy.get('.pf-c-dropdown__menu-item').contains('Remove role').click();
  cy.get('.pf-c-modal-box__body b').contains('owners_group');
  cy.get('.pf-c-modal-box__body b').contains(role);
  cy.get('.pf-c-modal-box__body b').contains(`rbac_owners`);
  cy.get('[data-cy=delete-button]').click();
  cy.get('.pf-c-alert__title')
    .contains(
      `Group "owners_group" roles successfully updated in "rbac_owners".`,
    )
    .parent('.pf-c-alert')
    .find('button')
    .click();

  // breadcrumb back to group list
  cy.get('.pf-c-breadcrumb__item a').last().click();

  // list view, delete, see empty
  cy.get(
    'tr[data-cy="OwnersTab-row-owners_group"] [data-cy=kebab-toggle] button',
  ).click();
  cy.get('.pf-c-dropdown__menu-item').contains('Remove group').click();
  cy.get('.pf-c-modal-box__body b').contains('owners_group');
  cy.get('.pf-c-modal-box__body b').contains(`rbac_owners`);
  cy.get('[data-cy=delete-button]').click();
  cy.get('.pf-c-alert__title')
    .contains(
      `Group "owners_group" has been successfully removed from "rbac_owners".`,
    )
    .parent('.pf-c-alert')
    .find('button')
    .click();
  cy.get('.pf-c-empty-state');
}
