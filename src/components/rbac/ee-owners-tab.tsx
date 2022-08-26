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
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import { GroupType, RoleType, ExecutionEnvironmentNamespaceAPI } from 'src/api';
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
  EmptyStateCustom,
} from 'src/components';
import { ParamHelper, errorMessage } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  addAlert: (alert) => void;
  group?: GroupType;
  groups: GroupType[];
  name: string;
  pulpObjectType: string;
  reload: () => void;
  selectRolesMessage: string;
  urlPrefix: string;
  namespaceId?: string;
}

interface IState {
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
}

export class EEOwnersTab extends React.Component<IProps, IState> {
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
    const { groups, group } = this.props;
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

        {!this.context.user.is_superuser &&
        !this.context.user.model_permissions.view_group ? (
          <EmptyStateCustom
            title={t`You do not have the required permissions.`}
            description={t`Please contact the server administrator for elevated permissions.`}
            icon={ExclamationTriangleIcon}
          />
        ) : noData ? (
          <EmptyStateNoData
            title={t`There are currently no owners assigned.`}
            description={t`Please add an owner by using the button below.`}
            button={buttonAdd}
          />
        ) : group ? (
          this.renderRoles({ group })
        ) : (
          this.renderGroups({ buttonAdd, groups })
        )}
      </>
    );
  }

  private renderGroups({ buttonAdd, groups }) {
    const sortedGroups = sortBy(groups, 'name');

    return (
      <>
        <div>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>{buttonAdd}</ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </div>

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
    const { urlPrefix } = this.props;

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
              ParamHelper.getQueryString({ group: group.name, tab: 'owners' })
            }
          >
            {group.name}
          </Link>
        </td>
        <ListItemActions kebabItems={dropdownItems} />
      </tr>
    );
  }

  private renderRoles({ group }) {
    const { showRoleRemoveModal, showRoleSelectWizard } = this.state;
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
        deleteAction={() =>
          this.removeRole(role, group, {
            alertSuccess: t`Role "${role}" successfully removed.`,
            alertFailure: t`Role "${role}" could not be removed from "${name}" group.`,
            afterState: { showRoleRemoveModal: null },
          })
        }
        title={t`Remove role ${role}?`}
        variant='medium'
      >
        <Trans>
          You are about to remove <b>{role}</b> from <b>{groupname}</b> for{' '}
          <b>{name}</b>.
        </Trans>
        &nbsp;
        {group.object_roles.length <= 1 && (
          <Trans>
            {' '}
            Removing this role will cause the entire group role to be removed.
          </Trans>
        )}
        <br />
        <Trans>This will also remove all associated permissions.</Trans>
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
        onSave={() => {
          this.addRoles(group, roles, {
            alertSuccess: t`Group "${group.name}" roles successfully added.`,
            alertFailure: t`Group "${group.name}" roles could not be added.`,
            afterState: { showGroupSelectWizard: null },
          });
        }}
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
        onSave={() =>
          this.addRoles(group, roles, {
            alertSuccess: t`Group "${group.name}" roles successfully updated.`,
            alertFailure: t`Group "${group.name}" roles could not be updated.`,
            afterState: { showRoleSelectWizard: null },
          })
        }
      />
    );
  }

  private removeGroup(group) {
    const rolesPromises = group.object_roles.map((role) =>
      ExecutionEnvironmentNamespaceAPI.removeRole(this.props.namespaceId, {
        role,
        groups: [group.name],
      }),
    );

    Promise.all(rolesPromises)
      .then(() => {
        this.props.addAlert({
          title: t`Group "${group.name}" has been successfully removed from "${this.props.name}".`,
          variant: 'success',
        });
        this.props.reload(); // ensure reload() sets groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
          title: t`Group "${group.name}" could not be removed from "${this.props.name}".`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        this.setState({
          showGroupRemoveModal: null,
        });
      });
  }

  private addRoles(group, roles, { alertSuccess, alertFailure, afterState }) {
    const rolePromises = roles.map((role) =>
      ExecutionEnvironmentNamespaceAPI.addRole(this.props.namespaceId, {
        role: role.name,
        groups: [group.name],
      }),
    );

    Promise.all(rolePromises)
      .then(() => {
        this.props.addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        this.props.reload(); // ensure reload() sets groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        this.setState(afterState);
      });
  }

  private removeRole(role, group, { alertSuccess, alertFailure, afterState }) {
    ExecutionEnvironmentNamespaceAPI.removeRole(this.props.namespaceId, {
      role,
      groups: [group.name],
    })
      .then(() => {
        this.props.addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        this.props.reload(); // ensure reload() sets groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        this.setState(afterState);
      });
  }
}
EEOwnersTab.contextType = AppContext;
