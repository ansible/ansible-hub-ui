import { Trans, t } from '@lingui/macro';
import {
  Button,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { sortBy } from 'lodash';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { GroupType, RoleType } from 'src/api';
import {
  DeleteModal,
  EmptyStateNoData,
  EmptyStateXs,
  ExpandableRow,
  ListItemActions,
  LoadingSpinner,
  PreviewRoles,
  RoleListTable,
  RolePermissions,
  SelectGroup,
  SelectRoles,
  SelectUser,
  SortTable,
  WizardModal,
} from 'src/components';
import { ParamHelper } from 'src/utilities';

interface UserType {
  username: string;
  object_roles: string[];
}

interface IProps {
  // users
  user?: UserType;
  users: UserType[];
  addUser?: (user, roles) => void;
  removeUser?: (user) => void;
  addUserRole?: (role, users) => void;
  removeUserRole?: (role, user) => void;
  showUserRemoveModal?: UserType;
  showUserSelectWizard?: { user?: UserType; roles?: RoleType[] };

  // groups
  group?: GroupType;
  groups: GroupType[];
  addGroup?: (group, roles) => void;
  removeGroup?: (group) => void;
  addRole?: (role, groups) => void;
  removeRole?: (role, group) => void;
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };

  // roles
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };

  // parent
  name: string;
  pulpObjectType: string;
  selectRolesMessage: string;
  urlPrefix: string;
  canEditOwners: boolean;
  updateProps: (prop) => void;
}

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className='pf-v5-c-title'>{title}</h2>
);
const SectionSeparator = () => (
  <div
    style={{
      backgroundColor: 'var(--pf-v5-global--BackgroundColor--light-300)',
      height: '16px',
      margin: '16px -16px',
    }}
  />
);

export class AccessTab extends Component<IProps> {
  render() {
    const {
      canEditOwners,
      group,
      groups,
      showGroupRemoveModal,
      showGroupSelectWizard,
      showUserRemoveModal,
      showUserSelectWizard,
      user,
      users,
      updateProps,
    } = this.props;

    const loading = !groups && !users;
    const noData = users?.length === 0 && groups?.length === 0;

    const buttonAdd = (title, props) => (
      <Button key={title} onClick={() => updateProps(props)}>
        {title}
      </Button>
    );

    const buttonUserAdd = buttonAdd(t`Select a user`, {
      showUserSelectWizard: {},
    });
    const buttonGroupAdd = buttonAdd(t`Select a group`, {
      showGroupSelectWizard: {},
    });

    return loading ? (
      <LoadingSpinner />
    ) : (
      <>
        {showUserRemoveModal ? this.renderUserRemoveModal() : null}
        {showUserSelectWizard ? this.renderUserSelectWizard() : null}
        {showGroupRemoveModal ? this.renderGroupRemoveModal() : null}
        {showGroupSelectWizard ? this.renderGroupSelectWizard() : null}

        {noData ? (
          <EmptyStateNoData
            title={t`There are currently no owners assigned.`}
            description={
              canEditOwners
                ? t`Please add an owner by using the buttons below.`
                : ''
            }
            button={
              canEditOwners ? (
                <>
                  {buttonUserAdd} {buttonGroupAdd}
                </>
              ) : null
            }
          />
        ) : user || group ? (
          this.renderRoles()
        ) : (
          <>
            {this.renderSection({
              buttonAdd: buttonUserAdd,
              canEditOwners,
              emptyStateTitle: t`There are currently no users assigned.`,
              emptyStateExtra: t`Except for members of groups below.`,
              items: users,
              renderItems: () =>
                this.renderList({
                  ariaLabel: t`User list`,
                  canEditOwners,
                  itemName: t`User`,
                  buttonAdd: buttonUserAdd,
                  items: users,
                  renderItem: (item, index) => this.renderUserRow(item, index),
                  sortField: 'username',
                }),
              title: t`Users`,
            })}
            <SectionSeparator />
            {this.renderSection({
              buttonAdd: buttonGroupAdd,
              canEditOwners,
              emptyStateTitle: t`There are currently no groups assigned.`,
              items: groups,
              renderItems: () =>
                this.renderList({
                  ariaLabel: t`Group list`,
                  canEditOwners,
                  itemName: t`Group`,
                  buttonAdd: buttonGroupAdd,
                  items: groups,
                  renderItem: (item, index) => this.renderGroupRow(item, index),
                  sortField: 'name',
                }),
              title: t`Groups`,
            })}
          </>
        )}
      </>
    );
  }

  private renderSection({
    buttonAdd,
    canEditOwners,
    emptyStateTitle,
    emptyStateExtra = '',
    items,
    renderItems,
    title,
  }) {
    const loading = !items;
    const noData = items?.length === 0;

    return (
      <>
        <SectionTitle title={title} />
        {loading ? (
          <Spinner />
        ) : noData ? (
          <EmptyStateXs
            title={emptyStateTitle}
            description={
              <>
                {emptyStateExtra}
                {emptyStateExtra && <br />}
                {canEditOwners
                  ? t`Please add an owner by using the button below.`
                  : ''}
              </>
            }
            button={canEditOwners ? buttonAdd : null}
          />
        ) : (
          renderItems()
        )}
      </>
    );
  }

  private renderList({
    ariaLabel,
    buttonAdd,
    canEditOwners,
    itemName,
    items,
    renderItem,
    sortField,
  }) {
    const sorted = sortBy(items, sortField);

    return (
      <>
        {canEditOwners && (
          <div>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>{buttonAdd}</ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        )}

        <Table aria-label={ariaLabel}>
          <SortTable
            options={{
              headers: [
                {
                  title: itemName,
                  type: 'none',
                  id: sortField,
                },
                {
                  title: '',
                  type: 'none',
                  id: 'kebab',
                },
              ],
            }}
            params={{}}
            updateParams={() => null}
          />
          <Tbody>{sorted.map(renderItem)}</Tbody>
        </Table>
      </>
    );
  }

  private renderUserRow(user, index: number) {
    const { urlPrefix, canEditOwners, updateProps } = this.props;

    const dropdownItems = [
      canEditOwners && (
        <DropdownItem
          key='remove'
          onClick={() =>
            updateProps({
              showUserRemoveModal: user,
            })
          }
        >
          <Trans>Remove user</Trans>
        </DropdownItem>
      ),
    ];

    return (
      <Tr data-cy={`AccessTab-row-user-${user.username}`} key={index}>
        <Td>
          <Link
            to={
              urlPrefix +
              '?' +
              ParamHelper.getQueryString({
                user: user.username,
                tab: 'access',
              })
            }
          >
            {user.username}
          </Link>
        </Td>
        <ListItemActions kebabItems={dropdownItems} />
      </Tr>
    );
  }

  private renderGroupRow(group, index: number) {
    const { urlPrefix, canEditOwners, updateProps } = this.props;

    const dropdownItems = [
      canEditOwners && (
        <DropdownItem
          key='remove'
          onClick={() =>
            updateProps({
              showGroupRemoveModal: group,
            })
          }
        >
          <Trans>Remove group</Trans>
        </DropdownItem>
      ),
    ];

    return (
      <Tr data-cy={`AccessTab-row-group-${group.name}`} key={index}>
        <Td>
          <Link
            to={
              urlPrefix +
              '?' +
              ParamHelper.getQueryString({
                group: group.name,
                tab: 'access',
              })
            }
          >
            {group.name}
          </Link>
        </Td>
        <ListItemActions kebabItems={dropdownItems} />
      </Tr>
    );
  }

  private renderRoles() {
    const {
      canEditOwners,
      group,
      showRoleRemoveModal,
      showRoleSelectWizard,
      updateProps,
      user,
    } = this.props;

    if ((!user && !group) || (user && group)) {
      return null;
    }

    const roles = (user || group).object_roles;
    const sortedRoles = sortBy(roles);

    const buttonAdd = (
      <Button
        onClick={() =>
          updateProps({
            showRoleSelectWizard: {},
          })
        }
      >
        {t`Add roles`}
      </Button>
    );

    return (
      <>
        {showRoleRemoveModal ? this.renderRoleRemoveModal() : null}
        {showRoleSelectWizard ? this.renderRoleSelectWizard() : null}

        <h3 className='pf-v5-c-title'>
          {user ? <Trans>User {user.username}</Trans> : null}
          {group ? <Trans>Group {group.name}</Trans> : null}
        </h3>

        {canEditOwners && (
          <div>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>{buttonAdd}</ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        )}

        <RoleListTable
          params={{}}
          updateParams={() => null}
          tableHeader={{
            headers: [
              {
                title: '',
                type: 'none',
                id: 'expander',
              },
              {
                title: t`Role`,
                type: 'none',
                id: 'role',
              },
              {
                title: '',
                type: 'none',
                id: 'kebab',
              },
            ],
          }}
        >
          {sortedRoles.map((role, i) => (
            <ExpandableRow
              key={i}
              rowIndex={i}
              expandableRowContent={<RolePermissions name={role} />}
              data-cy={`RoleListTable-ExpandableRow-row-${role}`}
            >
              <Td>{role}</Td>
              <ListItemActions
                kebabItems={[
                  canEditOwners && (
                    <DropdownItem
                      key='remove-role'
                      onClick={() => updateProps({ showRoleRemoveModal: role })}
                    >
                      {t`Remove role`}
                    </DropdownItem>
                  ),
                ]}
              />
            </ExpandableRow>
          ))}
        </RoleListTable>
      </>
    );
  }

  private renderUserRemoveModal() {
    const { name, showUserRemoveModal: user } = this.props;
    if (!user) {
      return;
    }

    const username = user.username;

    return (
      <DeleteModal
        cancelAction={() =>
          this.props.updateProps({ showUserRemoveModal: null })
        }
        deleteAction={() => this.props.removeUser(user)}
        title={t`Remove user ${username}?`}
      >
        <Trans>
          You are about to remove <b>{username}</b> from <b>{name}</b>.
          <br />
          This will also remove all associated permissions.
        </Trans>
      </DeleteModal>
    );
  }

  private renderGroupRemoveModal() {
    const { name, showGroupRemoveModal: group } = this.props;
    if (!group) {
      return;
    }

    const groupname = group.name;

    return (
      <DeleteModal
        cancelAction={() =>
          this.props.updateProps({ showGroupRemoveModal: null })
        }
        deleteAction={() => this.props.removeGroup(group)}
        title={t`Remove group ${groupname}?`}
      >
        <Trans>
          You are about to remove <b>{groupname}</b> from <b>{name}</b>.
          <br />
          This will also remove all associated permissions.
        </Trans>
      </DeleteModal>
    );
  }

  private renderRoleRemoveModal() {
    const { name, user, group, showRoleRemoveModal: role } = this.props;
    const userOrGroupName = group?.name || user?.username;

    return (
      <DeleteModal
        cancelAction={() =>
          this.props.updateProps({ showRoleRemoveModal: null })
        }
        deleteAction={() => {
          group && this.props.removeRole(role, group);
          user && this.props.removeUserRole(role, user);
        }}
        title={t`Remove role ${role}?`}
      >
        <Trans>
          You are about to remove <b>{role}</b> from <b>{userOrGroupName}</b>{' '}
          for <b>{name}</b>.
          <br />
          This will also remove all associated permissions.
        </Trans>
      </DeleteModal>
    );
  }

  private renderUserSelectWizard() {
    const {
      users,
      pulpObjectType,
      selectRolesMessage,
      showUserSelectWizard: { user, roles = [] },
      updateProps,
    } = this.props;

    const hasUser = !!user;
    const hasRoles = !!roles?.length;

    // if we enable edit, find user in users, convert object_roles name to { role: name }
    const assignedRoles = [];

    const steps = [
      {
        id: 0,
        name: t`Select a user`,
        component: (
          <SelectUser
            assignedUsers={users}
            selectedUser={user}
            updateUser={(user) =>
              updateProps({
                showUserSelectWizard: { user, roles },
              })
            }
          />
        ),
        backButtonText: t`Cancel`,
        enableNext: hasUser,
      },
      {
        id: 1,
        name: t`Select role(s)`,
        component: (
          <SelectRoles
            assignedRoles={assignedRoles}
            selectedRoles={roles}
            onRolesUpdate={(roles) =>
              updateProps({
                showUserSelectWizard: { user, roles },
              })
            }
            message={selectRolesMessage}
            pulpObjectType={pulpObjectType}
          />
        ),
        canJumpTo: hasUser,
        enableNext: hasUser && hasRoles,
      },
      {
        id: 2,
        name: t`Preview`,
        component: <PreviewRoles user={user} selectedRoles={roles} />,
        nextButtonText: t`Add`,
        canJumpTo: hasUser && hasRoles,
        isFinished: true,
      },
    ];

    return (
      <WizardModal
        steps={steps}
        title={t`Select a user`}
        onClose={() =>
          updateProps({
            showUserSelectWizard: null,
          })
        }
        onSave={() => this.props.addUser(user, roles)}
      />
    );
  }

  private renderGroupSelectWizard() {
    const {
      groups,
      pulpObjectType,
      selectRolesMessage,
      showGroupSelectWizard: { group, roles = [] },
      updateProps,
    } = this.props;

    const hasGroup = !!group;
    const hasRoles = !!roles?.length;

    // if we enable edit, find group in groups, convert object_roles name to { role: name }
    const assignedRoles = [];

    const steps = [
      {
        id: 0,
        name: t`Select a group`,
        component: (
          <SelectGroup
            assignedGroups={groups}
            selectedGroup={group}
            updateGroup={(group) =>
              updateProps({
                showGroupSelectWizard: { group, roles },
              })
            }
          />
        ),
        backButtonText: t`Cancel`,
        enableNext: hasGroup,
      },
      {
        id: 1,
        name: t`Select role(s)`,
        component: (
          <SelectRoles
            assignedRoles={assignedRoles}
            selectedRoles={roles}
            onRolesUpdate={(roles) =>
              updateProps({
                showGroupSelectWizard: { group, roles },
              })
            }
            message={selectRolesMessage}
            pulpObjectType={pulpObjectType}
          />
        ),
        canJumpTo: hasGroup,
        enableNext: hasGroup && hasRoles,
      },
      {
        id: 2,
        name: t`Preview`,
        component: <PreviewRoles group={group} selectedRoles={roles} />,
        nextButtonText: t`Add`,
        canJumpTo: hasGroup && hasRoles,
        isFinished: true,
      },
    ];

    return (
      <WizardModal
        steps={steps}
        title={t`Select a group`}
        onClose={() =>
          updateProps({
            showGroupSelectWizard: null,
          })
        }
        onSave={() => this.props.addGroup(group, roles)}
      />
    );
  }

  private renderRoleSelectWizard() {
    const {
      group,
      pulpObjectType,
      showRoleSelectWizard: { roles = [] },
      updateProps,
      user,
    } = this.props;

    const hasRoles = !!roles?.length;

    const assignedRoles =
      (group || user || {}).object_roles?.map((name) => ({ role: name })) || [];

    const steps = [
      {
        id: 0,
        name: t`Select role(s)`,
        component: (
          <SelectRoles
            assignedRoles={assignedRoles}
            selectedRoles={roles}
            onRolesUpdate={(roles) =>
              updateProps({ showRoleSelectWizard: { roles } })
            }
            pulpObjectType={pulpObjectType}
          />
        ),
        backButtonText: t`Cancel`,
        enableNext: hasRoles,
      },
      {
        id: 1,
        name: t`Preview`,
        component: (
          <PreviewRoles user={user} group={group} selectedRoles={roles} />
        ),
        nextButtonText: t`Add`,
        canJumpTo: hasRoles,
        isFinished: true,
      },
    ];

    return (
      <WizardModal
        steps={steps}
        title={t`Select role(s)`}
        onClose={() =>
          updateProps({
            showRoleSelectWizard: null,
          })
        }
        onSave={() => {
          group && this.props.addRole(group, roles);
          user && this.props.addUserRole(user, roles);
        }}
      />
    );
  }
}
