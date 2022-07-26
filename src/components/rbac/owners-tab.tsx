import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { sortBy } from 'lodash';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { GroupType, RoleType } from 'src/api';
import {
  DeleteModal,
  EmptyStateNoData,
  ExpandableRow,
  GroupRolePermissions,
  ListItemActions,
  LoadingPageSpinner,
  PreviewRoles,
  RoleListTable,
  SelectGroup,
  SelectRoles,
  SortTable,
  WizardModal,
} from 'src/components';
import { ParamHelper, errorMessage } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  addAlert: (alert) => void;
  groupId?: number;
  groups: GroupType[];
  name: string;
  pulpObjectType: string;
  reload: () => void;
  selectRolesMessage: string;
  updateGroups: (groups: GroupType[]) => Promise<void>;
  urlPrefix: string;
  canEditOwners: boolean;
}

interface IState {
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
}

export class OwnersTab extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      showGroupRemoveModal: null,
      showGroupSelectWizard: null,
      showRoleRemoveModal: null,
      showRoleSelectWizard: null,
    };
  }

  render() {
    const { groups, groupId, canEditOwners } = this.props;
    const { showGroupRemoveModal, showGroupSelectWizard } = this.state;
    const loading = !groups;
    const noData = groups?.length === 0;

    const buttonAdd = (
      <Button
        onClick={() =>
          this.setState({
            showGroupSelectWizard: {},
          })
        }
      >
        {t`Select a group`}
      </Button>
    );

    return loading ? (
      <LoadingPageSpinner />
    ) : (
      <>
        {showGroupRemoveModal ? this.renderGroupRemoveModal() : null}
        {showGroupSelectWizard ? this.renderGroupSelectWizard() : null}

        {noData ? (
          <EmptyStateNoData
            title={t`There are currently no owners assigned.`}
            description={
              canEditOwners
                ? t`Please add an owner by using the button below.`
                : ''
            }
            button={canEditOwners ? buttonAdd : null}
          />
        ) : groupId ? (
          this.renderRoles({ groupId })
        ) : (
          this.renderGroups({ buttonAdd, groups })
        )}
      </>
    );
  }

  private renderGroups({ buttonAdd, groups }) {
    const sortedGroups = sortBy(groups, 'name');

    const { canEditOwners } = this.props;

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

        <table
          aria-label={t`Group list`}
          className='hub-c-table-content pf-c-table'
        >
          <SortTable
            options={{
              headers: [
                {
                  title: t`Group`,
                  type: 'none',
                  id: 'name',
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
          <tbody>
            {sortedGroups.map((group, i) => this.renderGroupRow(group, i))}
          </tbody>
        </table>
      </>
    );
  }

  private renderGroupRow(group, index: number) {
    const { urlPrefix, canEditOwners } = this.props;

    const dropdownItems = [
      this.context.user.model_permissions.change_containernamespace && (
        <DropdownItem
          key='remove'
          onClick={() => {
            this.setState({
              showGroupRemoveModal: group,
            });
          }}
        >
          <Trans>Remove group</Trans>
        </DropdownItem>
      ),
    ];

    return (
      <tr data-cy={`OwnersTab-row-${group.name}`} key={index}>
        <td>
          <Link
            to={
              urlPrefix +
              '?' +
              ParamHelper.getQueryString({ group: group.id, tab: 'owners' })
            }
          >
            {group.name}
          </Link>
        </td>
        {canEditOwners && <ListItemActions kebabItems={dropdownItems} />}
      </tr>
    );
  }

  private renderRoles({ groupId }) {
    const { showRoleRemoveModal, showRoleSelectWizard } = this.state;
    const group = this.props.groups.find(({ id }) => Number(groupId) === id);
    const roles = group?.object_roles;
    const sortedRoles = sortBy(roles);

    if (!group) {
      return null;
    }

    const buttonAdd = this.context.user.is_superuser && (
      <Button
        onClick={() =>
          this.setState({
            showRoleSelectWizard: {},
          })
        }
      >
        {t`Add roles`}
      </Button>
    );

    return (
      <>
        {showRoleRemoveModal ? this.renderRoleRemoveModal(group) : null}
        {showRoleSelectWizard ? this.renderRoleSelectWizard(group) : null}

        <div>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>{buttonAdd}</ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </div>

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
              expandableRowContent={<GroupRolePermissions name={role} />}
              data-cy={`RoleListTable-ExpandableRow-row-${role}`}
            >
              <td>{role}</td>
              <ListItemActions
                kebabItems={[
                  this.context.user.is_superuser && (
                    <DropdownItem
                      key='remove-role'
                      onClick={() =>
                        this.setState({ showRoleRemoveModal: role })
                      }
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

  private renderGroupRemoveModal() {
    const group = this.state.showGroupRemoveModal as GroupType;
    const groupname = group.name;
    const name = this.props.name;

    return (
      <DeleteModal
        cancelAction={() => this.setState({ showGroupRemoveModal: null })}
        deleteAction={() => this.removeGroup(group)}
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

  private renderRoleRemoveModal(group) {
    const groupname = group.name;
    const name = this.props.name;
    const role = this.state.showRoleRemoveModal;

    return (
      <DeleteModal
        cancelAction={() => this.setState({ showRoleRemoveModal: null })}
        deleteAction={() => this.removeRole(role, group)}
        title={t`Remove role ${role}?`}
      >
        <Trans>
          You are about to remove <b>{role}</b> from <b>{groupname}</b> for{' '}
          <b>{name}</b>.
          <br />
          This will also remove all associated permissions.
        </Trans>
      </DeleteModal>
    );
  }

  private renderGroupSelectWizard() {
    const { groups, pulpObjectType, selectRolesMessage } = this.props;
    const {
      showGroupSelectWizard: { group, roles = [] },
    } = this.state;

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
              this.setState({ showGroupSelectWizard: { group, roles } })
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
              this.setState({ showGroupSelectWizard: { group, roles } })
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
          this.setState({
            showGroupSelectWizard: null,
          })
        }
        onSave={() => this.addGroup(group, roles)}
      />
    );
  }

  private renderRoleSelectWizard(group) {
    const { pulpObjectType } = this.props;
    const {
      showRoleSelectWizard: { roles = [] },
    } = this.state;

    const hasRoles = !!roles?.length;

    const assignedRoles =
      group?.object_roles?.map((name) => ({ role: name })) || [];

    const steps = [
      {
        id: 0,
        name: t`Select role(s)`,
        component: (
          <SelectRoles
            assignedRoles={assignedRoles}
            selectedRoles={roles}
            onRolesUpdate={(roles) =>
              this.setState({ showRoleSelectWizard: { roles } })
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
        component: <PreviewRoles group={group} selectedRoles={roles} />,
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
          this.setState({
            showRoleSelectWizard: null,
          })
        }
        onSave={() => this.updateGroup(group, roles)}
      />
    );
  }

  private updateGroups({ groups, alertSuccess, alertFailure, stateSuccess }) {
    const { reload, updateGroups } = this.props;

    return updateGroups(groups)
      .then(() => {
        this.setState(stateSuccess);
        this.props.addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        reload(); // ensure reload() sets groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }

  private addGroup(group, roles) {
    const { name, groups } = this.props;
    const newGroup = {
      ...group,
      object_roles: roles.map(({ name }) => name),
    };
    const newGroups = [...groups, newGroup];

    return this.updateGroups({
      groups: newGroups,
      stateSuccess: {
        showGroupSelectWizard: null,
      },
      alertSuccess: t`Group "${group.name}" has been successfully added to "${name}".`,
      alertFailure: t`Group "${group.name}" could not be added to "${name}".`,
    });
  }

  private removeGroup(group) {
    const { name, groups } = this.props;
    const newGroups = groups.filter((g) => g !== group);

    return this.updateGroups({
      groups: newGroups,
      stateSuccess: {
        showGroupRemoveModal: null,
      },
      alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
      alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
    });
  }

  private updateGroup(group, roles) {
    const { name, groups } = this.props;
    const newGroup = {
      ...group,
      object_roles: [...group.object_roles, ...roles.map(({ name }) => name)],
    };
    const newGroups = groups.map((g) => (g === group ? newGroup : g));

    return this.updateGroups({
      groups: newGroups,
      stateSuccess: { showRoleSelectWizard: null },
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
    });
  }

  private removeRole(role, group) {
    const { name, groups } = this.props;
    const newGroup = {
      ...group,
      object_roles: group.object_roles.filter((name) => name !== role),
    };
    const newGroups = groups.map((g) => (g === group ? newGroup : g));

    return this.updateGroups({
      groups: newGroups,
      stateSuccess: { showRoleRemoveModal: null },
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
    });
  }
}
OwnersTab.contextType = AppContext;
