import { Trans, t } from '@lingui/macro';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  GroupObjectPermissionType,
  GroupRoleAPI,
  GroupRoleType,
  RoleType,
} from 'src/api';
import {
  AppliedFilters,
  CompoundFilter,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  ExpandableRow,
  ListItemActions,
  LoadingPageWithHeader,
  Pagination,
  PermissionCategories,
  PreviewRoles,
  RoleListTable,
  SelectRoles,
  WizardModal,
} from 'src/components';
import { IAppContextType } from 'src/loaders/app-context';
import {
  ParamHelper,
  ParamType,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  translateLockedRolesDescription,
} from 'src/utilities';
import './group-detail-role-management.scss';

interface Props {
  params: ParamType;
  updateParams: (params) => void;
  context: IAppContextType;
  group: GroupObjectPermissionType;
  addAlert: (title, variant, description?) => void;
  nonQueryParams?: string[];
}

const GroupDetailRoleManagement: React.FC<Props> = ({
  params,
  updateParams,
  context,
  group,
  addAlert,
  nonQueryParams,
}) => {
  const [showAddRolesModal, setShowAddRolesModal] = useState<boolean>(false);
  const [selectedDeleteRole, setSelectedDeleteRole] =
    useState<GroupRoleType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<GroupRoleType[]>([]);
  const [rolesItemCount, setRolesItemCount] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [inputText, setInputText] = useState<string>(
    (params['role__icontains'] as string) || '',
  );
  const [isRoleDeleting, setIsRoleDeleting] = useState(false);

  useEffect(() => {
    queryRolesWithPermissions();
    setInputText((params['role__icontains'] as string) || '');
  }, [params]);

  const queryRolesWithPermissions = () => {
    setLoading(true);

    GroupRoleAPI.listRoles(group.id, {
      ...ParamHelper.getReduced({ ...params, content_object: null }, [
        'id',
        'tab',
        ...nonQueryParams,
      ]),
      sort: ParamHelper.validSortParams(params['sort'], ['role'], 'role'),
    })
      .then(({ data }) => {
        setRoles(data.results);
        setRolesItemCount(data.count);
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

  const deleteRole = () => {
    const pulpId = parsePulpIDFromURL(selectedDeleteRole.pulp_href);

    setIsRoleDeleting(true);
    GroupRoleAPI.removeRole(group.id, pulpId)
      .then(() => {
        setIsRoleDeleting(false);
        addAlert(
          t`Role "${selectedDeleteRole.role}" has been successfully removed.`,
          'success',
          t`All associated permissions under this role were removed.`,
        );
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        addAlert(
          t`Role "${selectedDeleteRole.role}" could not be deleted.`,
          'danger',
          errorMessage(status, statusText),
        );
      })
      .finally(() => {
        setIsRoleDeleting(false);
        setSelectedDeleteRole(null);
        queryRolesWithPermissions();
      });
  };

  const deleteModal = (
    <DeleteModal
      title={t`Delete role: ${selectedDeleteRole?.role}`}
      cancelAction={() => setSelectedDeleteRole(null)}
      deleteAction={deleteRole}
      spinner={isRoleDeleting}
      isDisabled={isRoleDeleting}
      data-cy='DeleteModal'
    >
      <Trans>
        You are about to remove <strong>{selectedDeleteRole?.role}</strong> from{' '}
        <strong>{group?.name}</strong>.
      </Trans>
      <br />
      <Trans>
        This will revoke all permissions associated with this role from the
        group.
      </Trans>
    </DeleteModal>
  );

  const { hasPermission } = context;

  const addRoles = hasPermission('galaxy.change_group') && (
    <Button
      onClick={() => setShowAddRolesModal(true)}
      variant='primary'
      data-cy='add-roles'
    >
      <Trans>Add roles</Trans>
    </Button>
  );

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

  const tableHeader = {
    headers: [
      {
        title: '',
        type: 'none',
        id: 'expander',
      },
      {
        title: t`Role`,
        type: 'alpha',
        id: 'role',
      },
      {
        title: t`Description`,
        type: 'none',
        id: 'description',
      },
      {
        title: '',
        type: 'none',
        id: 'kebab',
      },
    ],
  };

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
            const selectedRolesPromises = selectedRoles.map((role) =>
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
                })
                .finally(() => role),
            );

            Promise.all(selectedRolesPromises).then(() => {
              queryRolesWithPermissions();
              setShowAddRolesModal(false);
              setSelectedRoles([]);
            });
          }}
        />
      )}
      {noData ? (
        <section className='body hub-empty-state-box'>
          <EmptyStateNoData
            title={t`There are currently no roles assigned to this group.`}
            description={t`Please add a role by using the button below.`}
            button={addRoles}
          />
        </section>
      ) : (
        <section className='body'>
          <div className='hub-list-toolbar'>
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
                          title: t`Name`,
                        },
                      ]}
                    />
                  </ToolbarItem>
                  <ToolbarItem>{addRoles}</ToolbarItem>
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
            updateParams={(p) => updateParams(p)}
            params={params}
            ignoredParams={[
              'id',
              'page',
              'page_size',
              'sort',
              'tab',
              ...nonQueryParams,
            ]}
            niceNames={{
              role__icontains: t`Name`,
            }}
          />
          {!noFilteredData ? (
            <>
              <RoleListTable
                params={params}
                updateParams={updateParams}
                tableHeader={tableHeader}
              >
                {roles.map((role, i) => (
                  <ExpandableRow
                    key={i}
                    rowIndex={i}
                    expandableRowContent={
                      <PermissionCategories
                        permissions={role.permissions}
                        showCustom={true}
                        showEmpty={false}
                      />
                    }
                    data-cy={`RoleListTable-ExpandableRow-row-${role.role}`}
                  >
                    <td>{role.role}</td>
                    <td>
                      {translateLockedRolesDescription(
                        role.role,
                        role.description,
                      )}
                    </td>
                    <ListItemActions
                      kebabItems={[
                        hasPermission('galaxy.change_group') && (
                          <DropdownItem
                            key='remove-role'
                            onClick={() => setSelectedDeleteRole(role)}
                          >
                            {t`Remove role`}
                          </DropdownItem>
                        ),
                      ]}
                    />
                  </ExpandableRow>
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
