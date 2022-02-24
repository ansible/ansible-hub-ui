import React from 'react';
import { t } from '@lingui/macro';
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
} from 'src/components';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import axios from 'axios';
import './role.scss';
import { RoleType } from 'src/api/response-types/role';
import { RoleAPI } from 'src/api/role';
import { filterIsSet, ParamHelper, parsePulpIDFromURL } from 'src/utilities';
import { RoleManagementAPI } from 'src/api/role-management';
import { formatPath, Paths } from 'src/paths';
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
      params['sort'] = '-name_contains';
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
    const { params, roles, loading, roleCount, alerts, unauthorized } =
      this.state;

    const noData = roleCount === 0 && !filterIsSet(params, ['name__icontains']);
    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Role Management`}></BaseHeader>
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`No roles yet`}
            description={t`Roles will appear once created.`}
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
                                id: 'name',
                                title: t`Role name`,
                              },
                              {
                                id: 'description',
                                title: t`Description`,
                              },
                            ]}
                          />
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
                      name__contains: t`Role`,
                      description: t`Description`,
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
    console.log('ROLECOUNT: ', roles.length);
    if (roles.length === 0) {
      return <EmptyStateFilter />;
    }
    const sortTableOptions = {
      headers: [
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
        <tbody>{roles.map((role, i) => this.renderTableRow(role, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(role, index: number) {
    const { name, description, pulp_href } = role;
    const roleID = parsePulpIDFromURL(pulp_href);
    return (
      <tr aria-labelledby={name} key={index}>
        <td>
          <Link to={formatPath(Paths.roleDetail, { role: roleID })}>
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
          </Link>
        </td>
        <td>{description}</td>
      </tr>
    );
  }

  private queryRoles = () => {
    const { params } = this.state;
    this.setState({ loading: true }, () => {
      RoleManagementAPI.list(params)
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
