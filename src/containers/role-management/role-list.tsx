import React from 'react';
import { useState, useCallback } from 'react';
import { t, Trans } from '@lingui/macro';
import { AppContext } from 'src/loaders/app-context';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
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
} from 'src/components';
import {
  Button,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import './role.scss';
import { RoleType } from 'src/api/response-types/role';
import { filterIsSet, ParamHelper, parsePulpIDFromURL } from 'src/utilities';
import { RoleAPI } from 'src/api/role';
import { formatPath, Paths } from 'src/paths';
import { Tbody, Td, Tr, ExpandableRowContent } from '@patternfly/react-table';
import { Constants } from 'src/constants';

interface IState {
  roles: RoleType[];
  roleCount: number;
  alerts: AlertType[];
  loading: boolean;
  inputText: string;
  params: {
    page?: number;
    page_size?: number;
  };
  unauthorized: boolean;
  selectedRole: RoleType[];
  expanded: boolean;
  expandedRepoNames: string[];
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
      expanded: false,
      expandedRepoNames: [],
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
    const { params, loading, roleCount, alerts, unauthorized } = this.state;

    const noData = roleCount === 0 && !filterIsSet(params, ['name__icontains']);
    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
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
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () => this.queryRoles());
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__icontains',
                                title: t`Role name`,
                              },
                              {
                                id: 'description',
                                title: t`Description`,
                              },
                            ]}
                          />
                        </ToolbarItem>
                        <ToolbarItem>
                          <Button>
                            <Trans>Add roles</Trans>
                          </Button>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
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
                {loading ? (
                  <LoadingPageSpinner />
                ) : (
                  this.renderTable(this.state.params)
                )}
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

  private renderTable(params) {
    const { roles } = this.state;
    if (roles.length === 0) {
      return <EmptyStateFilter />;
    }
    const sortTableOptions = {
      headers: [
        // {
        //   title: null,
        //   type: null,
        //   id: null,
        // },
        {
          title: t`Role`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: t`Description`,
          type: 'alpha',
          id: 'description',
        },
      ],
    };

    return (
      <table
        aria-label={t`Role list`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => {
            p['page'] = 1;
            this.updateParams(p, () => this.queryRoles());
          }}
        />
        <Tbody>{roles.map((role, i) => this.renderTableRow(role, i))}</Tbody>
      </table>
    );
  }

  private renderTableRow(role, index: number) {
    const { name, description, pulp_href, permissions } = role;
    const roleID = parsePulpIDFromURL(pulp_href);

    return (
      <>
        <Tr aria-labelledby={name} key={index}>
          {/* <Td
          expand={{
            rowIndex: index,
            isExpanded: isRoleExpanded(role),
            onToggle: () => setRoleExpanded(role, !isRoleExpanded(role)),
          }} /> */}
          <Td>
            {/* <Link to={formatPath(Paths.roleDetail, { role: roleID })}> */}
            {/* <Tooltip
      content={
        (Constants.TASK_NAMES[name] &&
          i18n._(Constants.TASK_NAMES[name])) ||
        name
      }
    >
      {name}
    </Tooltip> */}
            {name}
            {/* </Link> */}
          </Td>
          <Td>{description}</Td>
        </Tr>
        <Tr isExpanded={this.state.expanded}>
          <Td>
            <ExpandableRowContent>
              {permissions.map((p) => {
                return <Tag>{p}</Tag>;
              })}
            </ExpandableRowContent>
          </Td>
        </Tr>
      </>
    );
  }

  private queryRoles = () => {
    const { params } = this.state;
    const initialExpandedRepoNames = this.state.roles
      .filter((role) => !!role.permissions)
      .map((role) => role.name); // Default to all expanded

    this.setState({ loading: true }, () => {
      RoleAPI.list(params)
        .then((result) => {
          this.setState({
            roles: result.data.results,
            roleCount: result.data.count,
            loading: false,
            expandedRepoNames: initialExpandedRepoNames,
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

  private handleExpansion = () => {
    return this.setState({ expanded: !this.state.expanded });
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
