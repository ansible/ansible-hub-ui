import React from 'react';
import { useState, useCallback } from 'react';
import { t, Trans } from '@lingui/macro';
import { AppContext } from 'src/loaders/app-context';
import {
  Link,
  RouteComponentProps,
  withRouter,
  Redirect,
} from 'react-router-dom';
import {
  AlertType,
  Pagination,
  BaseHeader,
  closeAlertMixin,
  CompoundFilter,
  EmptyStateFilter,
  LoadingPageSpinner,
  Main,
  SortTable,
  AlertList,
  EmptyStateUnauthorized,
  EmptyStateNoData,
  AppliedFilters,
  Tag,
  StatefulDropdown,
  DeleteModal,
} from 'src/components';
import {
  Button,
  DropdownItem,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
// import './role.scss';
import { RoleType } from 'src/api/response-types/role';
import {
  errorMessage,
  filterIsSet,
  ParamHelper,
  parsePulpIDFromURL,
} from 'src/utilities';
import { RoleAPI } from 'src/api/role';
import { formatPath, Paths } from 'src/paths';
import {
  Tbody,
  Td,
  Tr,
  ExpandableRowContent,
  TableComposable,
  Th,
} from '@patternfly/react-table';
import { Constants } from 'src/constants';

interface IState {
  roles: RoleType[];
  roleCount: number;
  redirect?: string;
  alerts: AlertType[];
  loading: boolean;
  inputText: string;
  params: {
    page?: number;
    page_size?: number;
  };
  unauthorized: boolean;
  selectedRole: RoleType[];
  expandedRoleNames: string[];
  roleToEdit: RoleType;
  showDeleteModal: boolean;
}
export class RoleList extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = '-pulp_created';
    }

    this.state = {
      roles: [],
      alerts: [],
      loading: true,
      inputText: '',
      params: params,
      roleCount: 0,
      unauthorized: false,
      selectedRole: null,
      expandedRoleNames: [],
      roleToEdit: null,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    if (!this.context.user || !this.context.user.model_permissions.view_group) {
      this.setState({ loading: false, unauthorized: true });
    } else {
      this.queryRoles();
    }
  }

  render() {
    const {
      params,
      loading,
      roleCount,
      alerts,
      unauthorized,
      showDeleteModal,
      roleToEdit,
    } = this.state;

    const noData =
      roleCount === 0 && !filterIsSet(params, ['name__icontains', 'locked']);
    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {showDeleteModal && roleToEdit && (
          <DeleteModal
            cancelAction={() =>
              this.setState({ showDeleteModal: false, roleToEdit: null })
            }
            deleteAction={() => this.deleteRole(roleToEdit)}
            title={t`Delete role?`}
          >
            <Trans>
              <p>
                Role <b>{roleToEdit.name}</b> will be permanently deleted.
              </p>
              <p>
                This will also remove all associated permissions under this
                role.
              </p>
            </Trans>
          </DeleteModal>
        )}
        <BaseHeader title={t`Roles`}></BaseHeader>
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`There are currently no roles`}
            description={t`Please add a role by using the button below.`}
            button={
              <Button>
                <Trans>Add roles</Trans>
              </Button>
            }
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='role-list'>
                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryRoles())
                    }
                    count={roleCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) => {
                      this.updateParams(p, () => this.queryRoles());
                      this.setState({ inputText: '' });
                    }}
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                    niceNames={{
                      name__icontains: t`Role name`,
                    }}
                  />
                </div>

                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryRoles())
                  }
                  count={roleCount}
                />
              </section>
            )}
          </Main>
        )}
      </React.Fragment>
    );
  }

  private deleteRole({ pulp_href, name }) {
    const roleID = parsePulpIDFromURL(pulp_href);
    RoleAPI.delete(roleID)
      .then(() =>
        this.addAlert(
          <Trans>
            Remote registry &quot;{name}&quot; has been successfully deleted.
          </Trans>,
          'success',
        ),
      )
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`Role "${name}" could not be deleted.`,
          'danger',
          errorMessage(status, statusText),
        );
      })
      .then(() => {
        this.queryRoles();
        this.setState({ showDeleteModal: false, roleToEdit: null });
      });
  }

  private queryRoles = () => {
    const { params } = this.state;
    this.setState({ loading: true }, () => {
      RoleAPI.list(params)
        .then((result) => {
          this.setState({
            roles: result.data.results,
            roleCount: result.data.count,
            loading: false,
          });
        })
        .catch((err) => {
          this.setState({
            roleCount: 0,
            loading: false,
          });
          this.addAlert(t`Roles list could not be displayed.`, 'danger');
        });
    });
  };

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(RoleList);
RoleList.contextType = AppContext;
