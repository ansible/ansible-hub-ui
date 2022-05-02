import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './certification-dashboard.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  BaseHeader,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ListItemActions,
  Main,
} from 'src/components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  DropdownItem,
  Label,
} from '@patternfly/react-core';

import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';

import {
  CollectionVersionAPI,
  CollectionVersion,
  TaskAPI,
  CertificateUploadAPI,
  Repositories,
} from 'src/api';
import { errorMessage, filterIsSet, ParamHelper } from 'src/utilities';
import {
  LoadingPageWithHeader,
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  AlertList,
  closeAlertMixin,
  AlertType,
  SortTable,
  UploadSingCertificateModal,
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
  inputText: string;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate: CollectionVersion;
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
      inputText: '',
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
    };
  }

  componentDidMount() {
    if (
      !this.context.user ||
      this.context.user.is_anonymous ||
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
        <BaseHeader title={t`Approval dashboard`}></BaseHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main className='hub-certification-dashboard'>
            <section className='body' data-cy='body'>
              <div className='toolbar hub-certification-dashboard-toolbar'>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        inputText={this.state.inputText}
                        onChange={(text) => {
                          this.setState({ inputText: text });
                        }}
                        updateParams={(p) =>
                          this.updateParams(p, () => this.queryCollections())
                        }
                        params={params}
                        filterConfig={[
                          {
                            id: 'namespace',
                            title: t`Namespace`,
                          },
                          {
                            id: 'name',
                            title: t`Collection Name`,
                          },
                          {
                            id: 'repository',
                            title: t`Status`,
                            inputType: 'select',
                            options: [
                              {
                                id: Constants.NOTCERTIFIED,
                                title: t`Rejected`,
                              },
                              {
                                id: Constants.NEEDSREVIEW,
                                title: t`Needs Review`,
                              },
                              {
                                id: Constants.PUBLISHED,
                                title: t`Approved`,
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
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={(p) => {
                    this.updateParams(p, () => this.queryCollections());
                    this.setState({ inputText: '' });
                  }}
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                  niceValues={{
                    repository: {
                      [Constants.PUBLISHED]: t`Approved`,
                      [Constants.NEEDSREVIEW]: t`Needs Review`,
                      [Constants.NOTCERTIFIED]: t`Rejected`,
                    },
                  }}
                  niceNames={{
                    repository: t`Status`,
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
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  count={itemCount}
                />
              </div>
            </section>
            <UploadSingCertificateModal
              isOpen={this.state.uploadCertificateModalOpen}
              onCancel={() => this.closeUploadCertificateModal()}
              onSubmit={(d) => this.submitCertificate(d)}
            />
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
          title={t`No managed collections yet`}
          description={t`Collections will appear once uploaded`}
        />
      );
    }
    const sortTableOptions = {
      headers: [
        {
          title: t`Namespace`,
          type: 'alpha',
          id: 'namespace',
        },
        {
          title: t`Collection`,
          type: 'alpha',
          id: 'collection',
        },
        {
          title: t`Version`,
          type: 'number',
          id: 'version',
        },
        {
          title: t`Date created`,
          type: 'number',
          id: 'pulp_created',
        },
        {
          title: t`Status`,
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
        aria-label={t`Collection versions`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) =>
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
        <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
          {version.sign_state === 'signed'
            ? t`Signed and approved`
            : t`Approved`}
        </Label>
      );
    }
    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      return (
        <Label variant='outline' color='red' icon={<ExclamationCircleIcon />}>
          {t`Rejected`}
        </Label>
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      return (
        <Label
          variant='outline'
          color='orange'
          icon={<ExclamationTriangleIcon />}
        >
          {version.sign_state === 'unsigned' &&
          this.context.settings.GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL
            ? t`Needs signature and review`
            : t`Needs review`}
        </Label>
      );
    }
  }

  private renderRow(version: CollectionVersion, index) {
    return (
      <tr key={index} data-cy='CertificationDashboard-row'>
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
        {this.renderButtons(version)}
      </tr>
    );
  }

  private renderButtons(version: CollectionVersion) {
    const { featureFlags } = this.context;
    // not checking namespace permissions here, auto_sign happens API side, so is the permission check
    const canSign =
      featureFlags?.collection_signing && featureFlags?.collection_auto_sign;

    if (this.state.updatingVersions.includes(version)) {
      return <ListItemActions />; // empty td;
    }

    const needUploadSignature =
      (this.context.settings.GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL ?? true) &&
      version.sign_state === 'unsigned';
    const approveButton = [
      needUploadSignature && (
        <React.Fragment key='upload'>
          <Button onClick={() => this.openUploadCertificateModal(version)}>
            {t`Upload signature`}
          </Button>{' '}
        </React.Fragment>
      ),
      <Button
        key='approve'
        isDisabled={needUploadSignature}
        onClick={() =>
          this.updateCertification(
            version,
            Constants.NEEDSREVIEW,
            Constants.PUBLISHED,
          )
        }
      >
        {canSign ? t`Sign and approve` : t`Approve`}
      </Button>,
    ].filter(Boolean);

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
            {t`View Import Logs`}
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
        {canSign ? t`Sign and approve` : t`Approve`}
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
        {t`Reject`}
      </DropdownItem>
    );

    if (version.repository_list.includes(Constants.PUBLISHED)) {
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(true, Constants.PUBLISHED),
            rejectDropDown(false, Constants.PUBLISHED),
            importsLink,
          ]}
        />
      );
    }
    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(false, Constants.NOTCERTIFIED),
            rejectDropDown(true, Constants.NOTCERTIFIED),
            importsLink,
          ]}
        />
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      return (
        <ListItemActions
          kebabItems={[
            rejectDropDown(false, Constants.NEEDSREVIEW),
            importsLink,
          ]}
          buttons={approveButton}
        />
      );
    }
  }

  private openUploadCertificateModal(version: CollectionVersion) {
    this.setState({
      uploadCertificateModalOpen: true,
      versionToUploadCertificate: version,
    });
  }

  private async submitCertificate(file: File) {
    const version = this.state.versionToUploadCertificate;
    const response = await Repositories.getRepository({
      name: 'staging',
    });
    const signed_collection = `${PULP_API_BASE_PATH}content/ansible/collection_versions/${version.id}/`;

    CertificateUploadAPI.upload({
      file,
      repository: response.data.results[0].pulp_href,
      signed_collection,
    })
      .then((result) => {
        // This is a hack because it task return the full task api path:
        // eg.: /api/automation-hub/pulp/api/v3/tasks/0be64cb4-3b7e-4a6b-b35d-c3b589923a90/
        this.waitForUpdate(
          result.data.task.slice(0, -1).split('/').pop(),
          version,
        );
        this.addAlert(
          <Trans>
            Certificate for collection &quot;{version.namespace} {version.name}{' '}
            v{version.version}&quot; has been successfully uploaded.
          </Trans>,
          'success',
        );
      })
      .catch((error) => {
        const { status, statusText } = error.response;
        this.setState({
          alerts: this.state.alerts.concat({
            variant: 'danger',
            title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
            description: errorMessage(status, statusText),
          }),
        });
      })
      .finally(() => {
        this.closeUploadCertificateModal();
      });
  }

  private closeUploadCertificateModal() {
    this.setState({
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
    });
  }

  private updateCertification(version, originalRepo, destinationRepo) {
    const { alerts } = this.state;
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
          .then(
            (result) =>
              // Since pulp doesn't reply with the new object, perform a
              // second query to get the updated data
              {
                this.setState({
                  updatingVersions: [version],
                });
                this.waitForUpdate(result.data.remove_task_id, version);
              },
            this.addAlert(
              <Trans>
                Certification status for collection &quot;{version.namespace}{' '}
                {version.name} v{version.version}&quot; has been successfully
                updated.
              </Trans>,
              'success',
            ),
          )
          .catch((error) => {
            const { status, statusText } = error.response;
            this.setState({
              updatingVersions: [],
              alerts: alerts.concat({
                variant: 'danger',
                title: t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
                description: errorMessage(status, statusText),
              }),
            });
          }),
    );
  }

  private waitForUpdate(result, version) {
    const taskId = result;
    return TaskAPI.get(taskId).then(async (result) => {
      if (result.data.state === 'waiting' || result.data.state === 'running') {
        await new Promise((r) => setTimeout(r, 500));
        this.waitForUpdate(taskId, version);
      } else if (result.data.state === 'completed') {
        return CollectionVersionAPI.list(this.state.params).then(
          async (result) => {
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
            title: t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
            description: errorMessage(500, t`Internal Server Error`),
          }),
        });
      }
    });
  }

  private queryCollections() {
    this.setState({ loading: true }, () =>
      CollectionVersionAPI.list(this.state.params).then((result) => {
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
}

export default withRouter(CertificationDashboard);

CertificationDashboard.contextType = AppContext;
