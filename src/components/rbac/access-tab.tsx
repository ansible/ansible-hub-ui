import { Trans, t } from '@lingui/macro';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { sortBy } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
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
import { ParamHelper } from 'src/utilities';

interface IProps {
  group?: GroupType;
  groups: GroupType[];
  name: string;
  pulpObjectType: string;
  selectRolesMessage: string;
  urlPrefix: string;
  canEditOwners: boolean;
  addGroup?: (group, roles) => void;
  removeGroup?: (group) => void;
  addRole?: (role, groups) => void;
  removeRole?: (role, group) => void;
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
  updateProps: (prop) => void;
}

export class AccessTab extends React.Component<IProps> {
  render() {
    const { groups, group, canEditOwners } = this.props;
    const { showGroupRemoveModal, showGroupSelectWizard } = this.props;
    const loading = !groups;
    const noData = groups?.length === 0;

    const buttonAdd = (
      <Button
        onClick={() =>
          this.props.updateProps({
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
        ) : group ? (
          this.renderRoles({ group })
        ) : (
          this.renderGroups({ buttonAdd, groups })
        )}
      </>
    );
  }

  private renderGroups({ buttonAdd, groups }) {
    const { canEditOwners } = this.props;
    const sortedGroups = sortBy(groups, 'name');

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
      canEditOwners && (
        <DropdownItem
          key='remove'
          onClick={() => {
            this.props.updateProps({
              showGroupRemoveModal: group,
            });
          }}
        >
          <Trans>Remove group</Trans>
        </DropdownItem>
      ),
    ];

    return (
      <tr data-cy={`AccessTab-row-${group.name}`} key={index}>
        <td>
          <Link
            to={
              urlPrefix +
              '?' +
              ParamHelper.getQueryString({
                group: group?.id || group?.name,
                tab: 'access',
              })
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
    const { canEditOwners } = this.props;
    const { showRoleRemoveModal, showRoleSelectWizard } = this.props;
    const roles = group?.object_roles;
    const sortedRoles = sortBy(roles);

    if (!group) {
      return null;
    }

    const buttonAdd = (
      <Button
        onClick={() =>
          this.props.updateProps({
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
              expandableRowContent={<GroupRolePermissions name={role} />}
              data-cy={`RoleListTable-ExpandableRow-row-${role}`}
            >
              <td>{role}</td>
              <ListItemActions
                kebabItems={[
                  canEditOwners && (
                    <DropdownItem
                      key='remove-role'
                      onClick={() =>
                        this.props.updateProps({ showRoleRemoveModal: role })
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
    const group = this.props.showGroupRemoveModal as GroupType;
    const groupname = group.name;
    const name = this.props.name;

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

  private renderRoleRemoveModal(group) {
    const groupname = group.name;
    const name = this.props.name;
    const role = this.props.showRoleRemoveModal;

    return (
      <DeleteModal
        cancelAction={() =>
          this.props.updateProps({ showRoleRemoveModal: null })
        }
        deleteAction={() => this.props.removeRole(role, group)}
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
              this.props.updateProps({
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
              this.props.updateProps({
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
          this.props.updateProps({
            showGroupSelectWizard: null,
          })
        }
        onSave={() => this.props.addGroup(group, roles)}
      />
    );
  }

  private renderRoleSelectWizard(group) {
    const { pulpObjectType } = this.props;
    const {
      showRoleSelectWizard: { roles = [] },
    } = this.props;

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
              this.props.updateProps({ showRoleSelectWizard: { roles } })
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
          this.props.updateProps({
            showRoleSelectWizard: null,
          })
        }
        onSave={() => this.props.addRole(group, roles)}
      />
    );
  }
}
