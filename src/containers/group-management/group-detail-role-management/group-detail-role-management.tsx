import { t, Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';

import React, { useEffect, useState } from 'react';

import {
  AppliedFilters,
  CompoundFilter,
  DeleteModal,
  EmptyStateCustom,
  LoadingPageWithHeader,
  Pagination,
  RoleListTable,
  ExpandableRow,
  PermissionChipSelector,
  WizardModal,
  EmptyStateFilter,
  ListItemActions,
} from 'src/components';
import { GroupRoleAPI, GroupObjectPermissionType, RoleType } from 'src/api';

import {
  errorMessage,
  filterIsSet,
  ParamHelper,
  parsePulpIDFromURL,
  twoWayMapper,
} from 'src/utilities';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import { IAppContextType } from 'src/loaders/app-context';

import { CubesIcon } from '@patternfly/react-icons';

import { Constants } from 'src/constants';

import PreviewRoles from './preview-roles';
import SelectRoles from './select-roles';

import './group-detail-role-management.scss';

interface Props {
  params: object;
  updateParams: (params) => void;
  context: IAppContextType;
  group: GroupObjectPermissionType;
  addAlert: (title, variant, description?) => void;
}

const GroupDetailRoleManagement: React.FC<Props> = ({
  params,
  updateParams,
  context,
  group,
  addAlert,
}) => {
  const [showAddRolesModal, setShowAddRolesModal] = useState<boolean>(false);
  const [selectedDeleteRole, setSelectedDeleteRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [rolesItemCount, setRolesItemCount] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [inputText, setInputText] = useState(params['role__icontains'] || '');
  const [isRoleDeleting, setIsRoleDeleting] = useState(false);

  useEffect(() => {
    queryRolesWithPermissions();
    setInputText(params['role__icontains'] || '');
  }, [params]);

  const queryRolesWithPermissions = () => {
    setLoading(true);
    GroupRoleAPI.getRolesWithPermissions(
      group.id,
      ParamHelper.getReduced(params, ['id', 'tab']),
    )
      .then(({ data, count }) => {
        setRoles(data);
        setRolesItemCount(count);
        setLoading(false);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        addAlert(
          t`Permissions for group "${group.name}" could not be displayed.`,
          'danger',
          errorMessage(status, statusText),
        );
      });
  };

  const addRoles = (
    <Button onClick={() => setShowAddRolesModal(true)} variant='primary'>
      <Trans>Add roles</Trans>
    </Button>
  );

  const deleteRole = () => {
    const pulpId = parsePulpIDFromURL(selectedDeleteRole.pulp_href);

    setIsRoleDeleting(true);
    GroupRoleAPI.removeRole(group.id, pulpId)
      .then(() => {
        setIsRoleDeleting(false);
        addAlert(
          t`Role "${selectedDeleteRole.name}" has been successfully removed.`,
          'success',
          t`All associated permissions under this role were removed.`,
        );
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        addAlert(
          t`Role "${selectedDeleteRole.name}" could not be deleted.`,
          'danger',
          errorMessage(status, statusText),
        );
      })
      .finally(() => {
        setIsRoleDeleting(false);
        setSelectedDeleteRole(null);
      });
  };

  const deleteModal = (
    <DeleteModal
      title={t`Delete role: ${selectedDeleteRole?.name}`}
      cancelAction={() => setSelectedDeleteRole(null)}
      deleteAction={deleteRole}
      spinner={isRoleDeleting}
      isDisabled={isRoleDeleting}
    >
      <Trans>
        You are about to remove <strong>{selectedDeleteRole?.name}</strong>{' '}
        under <strong>{group?.name}</strong>.
      </Trans>
      <br />
      <Trans>
        This will also remove all associated permissions under this role.
      </Trans>
    </DeleteModal>
  );

  const { user, featureFlags } = context;
  let isUserMgmtDisabled = false;
  const filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };
  if (featureFlags) {
    isUserMgmtDisabled = featureFlags.external_authentication;
  }

  if (isUserMgmtDisabled) {
    Constants.USER_GROUP_MGMT_PERMISSIONS.forEach((perm) => {
      if (perm in filteredPermissions) {
        delete filteredPermissions[perm];
      }
    });
  }

  if (loading) {
    return (
      <section className='body'>
        <LoadingPageWithHeader />
      </section>
    );
  }

  const noData =
    roles.length === 0 && !filterIsSet(params, ['role__icontains']);

  const noFilteredData =
    roles.length === 0 && filterIsSet(params, ['role__icontains']);

  const title = t`Add roles`;

  const isPreviewEnabled = selectedRoles.length !== 0;

  const steps = [
    {
      id: 0,
      name: t`Select role(s)`,
      component: (
        <SelectRoles
          assignedRoles={roles}
          selectedRoles={selectedRoles}
          onRolesUpdate={(roles) => setSelectedRoles(roles)}
        />
      ),
      backButtonText: t`Cancel`,
      enableNext: isPreviewEnabled,
    },
    {
      id: 1,
      name: t`Preview`,
      component: <PreviewRoles group={group} selectedRoles={selectedRoles} />,
      nextButtonText: t`Add`,
      canJumpTo: isPreviewEnabled,
      isFinished: true,
    },
  ];

  const groups = Constants.PERMISSIONS;

  return (
    <>
      {selectedDeleteRole && deleteModal}
      {showAddRolesModal && (
        <WizardModal
          steps={steps}
          title={title}
          onClose={() => {
            setShowAddRolesModal(false);
            setSelectedRoles([]);
          }}
          onSave={() => {
            selectedRoles.forEach((role) => {
              GroupRoleAPI.addRoleToGroup(group.id, role)
                .then(() => {
                  addAlert(
                    t`Role ${role.name} has been successfully added to ${group.name}.`,
                    'success',
                  );
                })
                .catch((e) => {
                  const { status, statusText, data } = e.response;

                  const errMessage =
                    data?.non_field_errors?.length > 0
                      ? data.non_field_errors[0]
                      : errorMessage(status, statusText);

                  addAlert(
                    t`Role ${role.name} could not be assigned to group ${group.name}.`,
                    'danger',
                    errMessage,
                  );
                });
            });
            setShowAddRolesModal(false);
            setSelectedRoles([]);
          }}
        />
      )}
      {noData ? (
        <section className='body empty-state-box'>
          <EmptyStateCustom
            title={t`There are currently no roles assigned to this group.`}
            description={t`Please add a role by using the button below.`}
            button={addRoles}
            icon={CubesIcon}
          />
        </section>
      ) : (
        <section className='body'>
          <div className='hub-group-list-toolbar'>
            <Toolbar>
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <CompoundFilter
                      inputText={inputText}
                      onChange={(p) => setInputText(p)}
                      updateParams={updateParams}
                      params={params}
                      filterConfig={[
                        {
                          id: 'role__icontains',
                          title: t`name`,
                        },
                      ]}
                    />
                  </ToolbarItem>
                  {user.model_permissions.change_group && (
                    <ToolbarItem>{addRoles}</ToolbarItem>
                  )}
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>

            <Pagination
              count={rolesItemCount}
              params={params}
              updateParams={updateParams}
              isTop
              isCompact
            />
          </div>

          <AppliedFilters
            style={{ marginTop: '16px' }}
            updateParams={updateParams}
            params={params}
            ignoredParams={[
              'id',
              'isEditing',
              'page',
              'page_size',
              'sort',
              'tab',
              'username',
              'first_name',
              'last_name',
              'email',
            ]}
            niceNames={{
              role__icontains: t`Name`,
            }}
          />
          {!noFilteredData ? (
            <>
              <RoleListTable params={params} updateParams={updateParams}>
                {roles.map((role, i) => (
                  <React.Fragment key={i}>
                    <ExpandableRow
                      expandableRowContent={
                        <>
                          {groups.map((group) => (
                            <Flex
                              style={{ marginTop: '16px' }}
                              alignItems={{ default: 'alignItemsCenter' }}
                              key={group.name}
                              className={group.name}
                            >
                              <FlexItem style={{ minWidth: '200px' }}>
                                {i18n._(group.label)}
                              </FlexItem>
                              <FlexItem grow={{ default: 'grow' }}>
                                <PermissionChipSelector
                                  availablePermissions={group.object_permissions
                                    .filter(
                                      (perm) =>
                                        !role.permissions.find(
                                          (selected) => selected === perm,
                                        ),
                                    )
                                    .map((value) =>
                                      twoWayMapper(value, filteredPermissions),
                                    )
                                    .sort()}
                                  selectedPermissions={role.permissions
                                    .filter((selected) =>
                                      group.object_permissions.find(
                                        (perm) => selected === perm,
                                      ),
                                    )
                                    .map((value) =>
                                      twoWayMapper(value, filteredPermissions),
                                    )}
                                  menuAppendTo='inline'
                                  multilingual={true}
                                  isViewOnly={true}
                                />
                              </FlexItem>
                            </Flex>
                          ))}
                        </>
                      }
                    >
                      <td>{role.name}</td>
                      <td>{role.description}</td>
                      <ListItemActions
                        kebabItems={[
                          <DropdownItem
                            key='remove-role'
                            onClick={() => setSelectedDeleteRole(role)}
                          >
                            {t`Remove Role`}
                          </DropdownItem>,
                        ]}
                      />
                    </ExpandableRow>
                  </React.Fragment>
                ))}
              </RoleListTable>

              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={updateParams}
                  count={rolesItemCount}
                />
              </div>
            </>
          ) : (
            <EmptyStateFilter
              clearAllFilters={() => {
                updateParams(
                  ParamHelper.setParam(params, 'role__icontains', ''),
                );
              }}
            />
          )}
        </section>
      )}
    </>
  );
};
export default GroupDetailRoleManagement;
