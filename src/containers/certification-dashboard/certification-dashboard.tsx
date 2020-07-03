import * as React from 'react';
import './certification-dashboard.scss';

import * as moment from 'moment';
import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import { BaseHeader, Main } from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

import {
  InfoCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';

import {
  CollectionVersionAPI,
  CollectionVersion,
  CertificationStatus,
  ActiveUserAPI,
  MeType,
} from '../../api';
import { ParamHelper } from '../../utilities';
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
  SortFieldType,
  SortTable,
} from '../../components';
import { Paths, formatPath } from '../../paths';

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
  updatingVersions: string[];
  redirect: string;
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

    this.state = {
      versions: undefined,
      itemCount: 0,
      params: params,
      loading: true,
      updatingVersions: [],
      redirect: undefined,
      alerts: [],
    };
  }

  componentDidMount() {
    ActiveUserAPI.isPartnerEngineer().then(response => {
      const me: MeType = response.data;
      if (!me.is_partner_engineer) {
        this.setState({ redirect: Paths.notFound });
      } else {
        this.queryCollections();
      }
    });
  }

  render() {
    const { versions, params, itemCount, loading, redirect } = this.state;

    if (redirect) {
      return <Redirect to={redirect}></Redirect>;
    }

    if (!versions) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }
    return (
      <React.Fragment>
        <BaseHeader title='Certification dashboard'></BaseHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={i => this.closeAlert(i)}
        />
        <Main className='certification-dashboard'>
          <Section className='body'>
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
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private renderTable(versions, params) {
    if (versions.length === 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel='h2' size='lg'>
            No matches
          </Title>
          <EmptyStateBody>
            Please try adjusting your search query.
          </EmptyStateBody>
        </EmptyState>
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
              Paths.collection,
              {
                namespace: version.namespace,
                collection: version.name,
              },
              {
                version: version.version,
              },
            )}
          >
            {version.version}
          </Link>
        </td>
        <td>{moment(version.created_at).fromNow()}</td>
        <td>
          <div className='control-column'>
            <div>{this.renderButtons(version)}</div>
          </div>
        </td>
      </tr>
    );
  }

  private renderButtons(version: CollectionVersion) {
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

    const certifyDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() =>
          this.updateCertification(version, CertificationStatus.certified)
        }
        isDisabled={isDisabled}
        key='certify'
      >
        Certify
      </DropdownItem>
    );

    const rejectDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() =>
          this.updateCertification(version, CertificationStatus.notCertified)
        }
        isDisabled={isDisabled}
        className='rejected-icon'
        key='reject'
      >
        Reject
      </DropdownItem>
    );

    switch (version.certification) {
      case CertificationStatus.certified:
        return (
          <span>
            <StatefulDropdown
              items={[
                certifyDropDown(true),
                rejectDropDown(false),
                importsLink,
              ]}
            />
          </span>
        );
      case CertificationStatus.notCertified:
        return (
          <span>
            <StatefulDropdown
              items={[
                certifyDropDown(false),
                rejectDropDown(true),
                importsLink,
              ]}
            />
          </span>
        );
      case CertificationStatus.needsReview:
        return (
          <span>
            <Button
              onClick={() =>
                this.updateCertification(version, CertificationStatus.certified)
              }
            >
              <span>Certify</span>
            </Button>
            <StatefulDropdown items={[rejectDropDown(false), importsLink]} />
          </span>
        );
    }
  }

  private updateCertification(version, certification) {
    // Set the selected version to loading
    this.setState(
      {
        updatingVersions: this.state.updatingVersions.concat([version.id]),
      },
      () =>
        // Perform the PUT request
        CollectionVersionAPI.setCertifiation(
          version.namespace,
          version.name,
          version.version,
          certification,
        )
          .then(() =>
            // Since pulp doesn't reply with the new object, perform a
            // second query to get the updated data
            CollectionVersionAPI.list({
              namespace: version.namespace,
              name: version.name,
              version: version.version,
            }).then(result => {
              const updatedVersion = result.data.data[0];
              const newVersionList = [...this.state.versions];
              const ind = newVersionList.findIndex(
                x => x.id === updatedVersion.id,
              );
              newVersionList[ind] = updatedVersion;

              this.setState({
                versions: newVersionList,
                updatingVersions: this.state.updatingVersions.filter(
                  v => v != updatedVersion.id,
                ),
              });
            }),
          )
          .catch(error => {
            this.setState({
              updatingVersions: this.state.updatingVersions.filter(
                v => v != version.id,
              ),
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

  private queryCollections() {
    this.setState({ loading: true }, () =>
      CollectionVersionAPI.list(this.state.params).then(result => {
        debugger;
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
