import * as React from 'react';
import './certification-dashboard.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  BaseHeader,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  Main,
} from 'src/components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  DropdownItem,
} from '@patternfly/react-core';

import {
  InfoCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';

import { CollectionVersionAPI, CollectionVersion, TaskAPI } from 'src/api';
import { filterIsSet, ParamHelper } from 'src/utilities';
import {
  LoadingPageWithHeader,
  StatefulDropdown,
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  AlertList,
  closeAlertMixin,
  AlertType,
  SortTable,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  params: {
    certification?: string;
    namespace?: string;
    collection?: string;
    page?: number;
    page_size?: number;
  };
  alerts: AlertType[];
  versions: CollectionVersion[];
  itemCount: number;
  loading: boolean;
  updatingVersions: CollectionVersion[];
  unauthorized: boolean;
}

class CertificationDashboard extends React.Component<
  RouteComponentProps,
  IState
> {
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

    if (!params['repository']) {
      params['repository'] = 'staging';
    }

    this.state = {
      versions: undefined,
      itemCount: 0,
      params: params,
      loading: true,
      updatingVersions: [],
      alerts: [],
      unauthorized: false,
    };
  }

  componentDidMount() {
    if (
      !this.context.user ||
      !this.context.user.model_permissions.move_collection
    ) {
      this.setState({ unauthorized: true });
    } else {
      this.queryCollections();
    }
  }

  render() {
    const { versions, params, itemCount, loading, unauthorized } = this.state;

    if (!versions && !unauthorized) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    return (
      <React.Fragment>
        <BaseHeader title='Approval dashboard'></BaseHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={i => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main className='certification-dashboard'>
            <section className='body'>
              <div className='toolbar'>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        updateParams={p =>
                          this.updateParams(p, () => this.queryCollections())
                        }
                        params={params}
                        filterConfig={[
                          {
                            id: 'namespace',
                            title: 'Namespace',
                          },
                          {
                            id: 'name',
                            title: 'Collection Name',
                          },
                          {
                            id: 'repository',
                            title: 'Status',
                            inputType: 'select',
                            options: [
                              {
                                id: Constants.NOTCERTIFIED,
                                title: 'Rejected',
                              },
                              {
                                id: Constants.NEEDSREVIEW,
                                title: 'Needs Review',
                              },
                              {
                                id: Constants.PUBLISHED,
                                title: 'Approved',
                              },
                            ],
                          },
                        ]}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={p =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                  niceValues={{
                    repository: {
                      [Constants.PUBLISHED]: 'Approved',
                      [Constants.NEEDSREVIEW]: 'Needs Review',
                      [Constants.NOTCERTIFIED]: 'Rejected',
                    },
                  }}
                  niceNames={{
                    repository: 'Status',
                  }}
                />
              </div>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                this.renderTable(versions, params)
              )}

              <div className='footer'>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  count={itemCount}
                />
              </div>
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(versions, params) {
    if (versions.length === 0) {
      return filterIsSet(params, ['namespace', 'name', 'repository']) ? (
        <EmptyStateFilter />
      ) : (
        <EmptyStateNoData
          title={'No managed collections yet'}
          description={'Collections will appear once uploaded'}
        />
      );
    }
    let sortTableOptions = {
      headers: [
        {
          title: 'Namespace',
          type: 'alpha',
          id: 'namespace',
        },
        {
          title: 'Collection',
          type: 'alpha',
          id: 'collection',
        },
        {
          title: 'Version',
          type: 'number',
          id: 'version',
        },
        {
          title: 'Date created',
          type: 'number',
          id: 'pulp_created',
        },
        {
          title: 'Status',
          type: 'none',
          id: 'status',
        },
        {
          title: '',
          type: 'none',
          id: 'certify',
        },
      ],
    };

    return (
      <table
        aria-label='Collection versions'
        className='content-table pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p =>
            this.updateParams(p, () => this.queryCollections())
          }
        />
        <tbody>
          {versions.map((version, i) => this.renderRow(version, i))}
        </tbody>
      </table>
    );
  }

  private renderStatus(version: CollectionVersion) {
    if (this.state.updatingVersions.includes(version)) {
      return <span className='fa fa-lg fa-spin fa-spinner' />;
    }
    if (version.repository_list.includes(Constants.PUBLISHED)) {
      return (
        <span>
          <CheckCircleIcon
            style={{ color: 'var(--pf-global--success-color--100)' }}
          />{' '}
          Approved
        </span>
      );
    }
    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      return (
        <span>
          <ExclamationCircleIcon
            style={{ color: 'var(--pf-global--danger-color--100)' }}
          />{' '}
          Rejected
        </span>
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      return (
        <span>
          <InfoCircleIcon
            style={{ color: 'var(--pf-global--info-color--100)' }}
          />{' '}
          Needs Review
        </span>
      );
    }
  }

  private renderRow(version: CollectionVersion, index) {
    return (
      <tr
        aria-labelledby={`${version.namespace}.${version.name} v${version.version}`}
        key={index}
      >
        <td>{version.namespace}</td>
        <td>{version.name}</td>
        <td>
          <Link
            to={formatPath(
              Paths.collectionByRepo,
              {
                namespace: version.namespace,
                collection: version.name,
                repo: version.repository_list[0],
              },
              {
                version: version.version,
              },
            )}
          >
            {version.version}
          </Link>
        </td>
        <td>
          <DateComponent date={version.created_at} />
        </td>
        <td>{this.renderStatus(version)}</td>
        <td>
          <div className='control-column'>
            <div>{this.renderButtons(version)}</div>
          </div>
        </td>
      </tr>
    );
  }

  private renderButtons(version: CollectionVersion) {
    if (this.state.updatingVersions.includes(version)) {
      return;
    }
    const importsLink = (
      <DropdownItem
        key='imports'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: version.namespace,
                name: version.name,
                version: version.version,
              },
            )}
          >
            View Import Logs
          </Link>
        }
      />
    );

    const certifyDropDown = (isDisabled: boolean, originalRepo) => (
      <DropdownItem
        onClick={() =>
          this.updateCertification(version, originalRepo, Constants.PUBLISHED)
        }
        isDisabled={isDisabled}
        key='certify'
      >
        Approve
      </DropdownItem>
    );

    const rejectDropDown = (isDisabled: boolean, originalRepo) => (
      <DropdownItem
        onClick={() =>
          this.updateCertification(
            version,
            originalRepo,
            Constants.NOTCERTIFIED,
          )
        }
        isDisabled={isDisabled}
        className='rejected-icon'
        key='reject'
      >
        Reject
      </DropdownItem>
    );

    if (version.repository_list.includes(Constants.PUBLISHED)) {
      return (
        <span>
          <StatefulDropdown
            items={[
              certifyDropDown(true, Constants.PUBLISHED),
              rejectDropDown(false, Constants.PUBLISHED),
              importsLink,
            ]}
          />
        </span>
      );
    }
    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      return (
        <span>
          <StatefulDropdown
            items={[
              certifyDropDown(false, Constants.NOTCERTIFIED),
              rejectDropDown(true, Constants.NOTCERTIFIED),
              importsLink,
            ]}
          />
        </span>
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      return (
        <span>
          <Button
            onClick={() =>
              this.updateCertification(
                version,
                Constants.NEEDSREVIEW,
                Constants.PUBLISHED,
              )
            }
          >
            <span>Approve</span>
          </Button>
          <StatefulDropdown
            items={[rejectDropDown(false, Constants.NEEDSREVIEW), importsLink]}
          />
        </span>
      );
    }
  }

  private updateCertification(version, originalRepo, destinationRepo) {
    // Set the selected version to loading
    this.setState(
      {
        updatingVersions: [],
      },
      () =>
        CollectionVersionAPI.setRepository(
          version.namespace,
          version.name,
          version.version,
          originalRepo,
          destinationRepo,
        )
          .then(result =>
            // Since pulp doesn't reply with the new object, perform a
            // second query to get the updated data
            {
              this.setState({
                updatingVersions: [version],
              });
              this.waitForUpdate(result.data.remove_task_id, version);
            },
          )
          .catch(error => {
            this.setState({
              updatingVersions: [],
              alerts: this.state.alerts.concat({
                variant: 'danger',
                title: `API Error: ${error.response.status}`,
                description:
                  `Could not update the certification ` +
                  `status for ${version.namespace}.` +
                  `${version.name}.${version.version}.`,
              }),
            });
          }),
    );
  }

  private waitForUpdate(result, version) {
    const taskId = result;
    return TaskAPI.get(taskId).then(async result => {
      if (result.data.state === 'waiting' || result.data.state === 'running') {
        await new Promise(r => setTimeout(r, 500));
        this.waitForUpdate(taskId, version);
      } else if (result.data.state === 'completed') {
        return CollectionVersionAPI.list(this.state.params).then(
          async result => {
            this.setState({
              versions: result.data.data,
              updatingVersions: [],
            });
          },
        );
      } else {
        this.setState({
          updatingVersions: [],
          alerts: this.state.alerts.concat({
            variant: 'danger',
            title: `API Error: 500`,
            description:
              `Could not update the certification ` +
              `status for ${version.namespace}.` +
              `${version.name}.${version.version}.`,
          }),
        });
      }
    });
  }

  private queryCollections() {
    this.setState({ loading: true }, () =>
      CollectionVersionAPI.list(this.state.params).then(result => {
        this.setState({
          versions: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
          updatingVersions: [],
        });
      }),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(CertificationDashboard);

CertificationDashboard.contextType = AppContext;
