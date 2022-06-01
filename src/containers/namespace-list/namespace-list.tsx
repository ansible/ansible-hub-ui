import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  DropdownItem,
  Checkbox,
  Text,
} from '@patternfly/react-core';
import { RouteComponentProps, Redirect, Link } from 'react-router-dom';
import { t, Trans } from '@lingui/macro';

import { ParamHelper } from 'src/utilities/param-helper';
import {
  AlertList,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  LinkTabs,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  NamespaceCard,
  NamespaceModal,
  Pagination,
  Sort,
  StatefulDropdown,
  DeleteModal,
  SignAllCertificatesModal,
  AlertType,
  ImportModal,
} from 'src/components';
import {
  NamespaceAPI,
  NamespaceListType,
  MyNamespaceAPI,
  CollectionAPI,
  CollectionListType,
  SignCollectionAPI,
} from 'src/api';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { Constants } from 'src/constants';
import {
  errorMessage,
  filterIsSet,
  canSign as canSignNS,
  waitForTask,
} from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';
import { i18n } from '@lingui/core';

import './namespace-list.scss';

interface IState {
  namespaces: NamespaceListType[];
  itemCount: number;
  params: {
    name?: string;
    sort?: string;
    page?: number;
    page_size?: number;
    tenant?: string;
    keywords?: string;
  };
  hasPermission: boolean;
  isModalOpen: boolean;
  loading: boolean;
  redirect?: string;
  inputText: string;
  isOpenNamespaceModal: boolean;
  isOpenSignModal: boolean;
  isNamespaceEmpty: boolean;
  showImportModal: boolean;
  selectedNamespace: NamespaceListType;
  isNamespacePending: boolean;
  confirmDelete: boolean;
  canSign: boolean;
  collections: CollectionListType[];
  showControls: boolean;
  updateCollection: CollectionListType;
}

interface IProps extends RouteComponentProps {
  namespacePath: Paths;
  filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
  nonURLParams = ['tenant'];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 20;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      namespaces: undefined,
      itemCount: 0,
      params: params,
      hasPermission: true,
      isModalOpen: false,
      loading: true,
      inputText: params['keywords'] || '',
      isOpenNamespaceModal: false,
      isOpenSignModal: false,
      isNamespaceEmpty: false,
      showImportModal: false,
      selectedNamespace: null,
      isNamespacePending: false,
      confirmDelete: false,
      canSign: false,
      showControls: false, // becomes true when my-namespaces doesn't 404
      collections: [],
      updateCollection: null,
    };
  }

  private handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  };

  componentDidMount() {
    this.loadAll();
  }

  public loadAll() {
    if (this.props.filterOwner) {
      // Make a query with no params and see if it returns results to tell
      // if the user can edit namespaces
      MyNamespaceAPI.list({})
        .then((results) => {
          if (results.data.meta.count !== 0) {
            this.loadNamespaces();
          } else {
            this.setState({
              hasPermission: false,
              namespaces: [],
              loading: false,
            });
          }
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'danger',
                  title: t`Namespaces list could not be displayed.`,
                  description: errorMessage(status, statusText),
                },
              ]),
          );
        });
    } else {
      this.loadNamespaces();
    }
  }

  componentWillUnmount() {
    this.context.setAlerts([]);
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const {
      namespaces,
      params,
      itemCount,
      loading,
      inputText,
      isNamespacePending,
      isOpenNamespaceModal,
      confirmDelete,
      selectedNamespace,
      collections,
      isOpenSignModal,
      updateCollection,
      showImportModal,
    } = this.state;
    const { filterOwner } = this.props;
    const { user, alerts } = this.context;
    const noData =
      !filterIsSet(this.state.params, ['keywords']) &&
      namespaces !== undefined &&
      namespaces.length === 0;

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    // Namespaces or Partners
    const title = i18n._(namespaceBreadcrumb.name);

    const updateParams = (p) => {
      p['page'] = 1;
      this.updateParams(p, () => this.loadNamespaces());
    };

    const total_versions = collections.reduce(
      (acc, c) => acc + c.total_versions,
      0,
    );

    const unsigned_versions = collections.reduce(
      (acc, c) => acc + c.unsigned_versions,
      0,
    );

    return (
      <div className='hub-namespace-page'>
        {showImportModal && (
          <ImportModal
            isOpen={showImportModal}
            onUploadSuccess={() =>
              this.setState({
                redirect: formatPath(
                  Paths.myImports,
                  {},
                  {
                    namespace: selectedNamespace.name,
                  },
                ),
              })
            }
            // onCancel
            setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
            collection={updateCollection}
            namespace={selectedNamespace.name}
          />
        )}

        {isOpenSignModal && (
          <SignAllCertificatesModal
            name={this.state.selectedNamespace.name}
            numberOfAffected={total_versions}
            affectedUnsigned={unsigned_versions}
            isOpen={this.state.isOpenSignModal}
            onSubmit={() => {
              this.signAllCertificates(this.state.selectedNamespace);
            }}
            onCancel={() => {
              this.setState({ isOpenSignModal: false });
            }}
          />
        )}
        {isOpenNamespaceModal && (
          <DeleteModal
            spinner={this.state.isNamespacePending}
            cancelAction={() => {
              this.setState({
                isOpenNamespaceModal: false,
                confirmDelete: false,
              });
            }}
            deleteAction={() => this.deleteNamespace()}
            title={t`Delete namespace?`}
            isDisabled={!confirmDelete || isNamespacePending}
          >
            <>
              <Text className='delete-namespace-modal-message'>
                <Trans>
                  Deleting <b>{selectedNamespace.name}</b> and its data will be
                  lost.
                </Trans>
              </Text>
              <Checkbox
                isChecked={confirmDelete}
                onChange={(val) => this.setState({ confirmDelete: val })}
                label={t`I understand that this action cannot be undone.`}
                id='delete_confirm'
              />
            </>
          </DeleteModal>
        )}
        <NamespaceModal
          isOpen={this.state.isModalOpen}
          toggleModal={this.handleModalToggle}
          onCreateSuccess={(result) =>
            this.setState({
              redirect: formatPath(Paths.myCollections, {
                namespace: result['name'],
              }),
            })
          }
        ></NamespaceModal>
        <AlertList alerts={alerts} closeAlert={() => this.closeAlert()} />
        <BaseHeader title={title}>
          {!this.context.user.is_anonymous && (
            <div className='hub-tab-link-container'>
              <div className='tabs'>
                <LinkTabs
                  tabs={[
                    {
                      title: t`All`,
                      link: Paths[NAMESPACE_TERM],
                      active: !filterOwner,
                    },
                    {
                      title: t`My namespaces`,
                      link: Paths.myNamespaces,
                      active: filterOwner,
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {noData ? null : (
            <div className='toolbar'>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup style={{ marginLeft: 0 }}>
                    <ToolbarItem>
                      <CompoundFilter
                        inputText={inputText}
                        onChange={(text) => this.setState({ inputText: text })}
                        updateParams={updateParams}
                        params={params}
                        filterConfig={[{ id: 'keywords', title: t`keywords` }]}
                      />
                      <AppliedFilters
                        style={{ marginTop: '16px' }}
                        updateParams={(p) => {
                          updateParams(p);
                          this.setState({ inputText: '' });
                        }}
                        params={params}
                        ignoredParams={['page_size', 'page', 'sort']}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                  <ToolbarGroup style={{ alignSelf: 'start' }}>
                    <ToolbarItem>
                      <Sort
                        options={[
                          { title: t`Name`, id: 'name', type: 'alpha' },
                        ]}
                        params={params}
                        updateParams={updateParams}
                      />
                    </ToolbarItem>
                    {user?.model_permissions?.add_namespace && (
                      <ToolbarItem key='create-button'>
                        <Button
                          variant='primary'
                          onClick={this.handleModalToggle}
                        >
                          {t`Create`}
                        </Button>
                      </ToolbarItem>
                    )}
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
              <div>
                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.loadNamespaces())
                  }
                  count={itemCount}
                  isCompact
                  perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                />
              </div>
            </div>
          )}
        </BaseHeader>
        <section className='card-area'>{this.renderBody()}</section>
        {noData || loading ? null : (
          <section className='footer'>
            <Pagination
              params={params}
              updateParams={(p) =>
                this.updateParams(p, () => this.loadNamespaces())
              }
              perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
              count={itemCount}
            />
          </section>
        )}
      </div>
    );
  }

  private renderBody() {
    const { namespaces, loading } = this.state;
    const { namespacePath, filterOwner } = this.props;
    const { user } = this.context;

    const noDataTitle = t`No namespaces yet`;
    const noDataDescription = !filterOwner
      ? t`Namespaces will appear once created`
      : t`This account is not set up to manage any namespaces`;

    const noDataButton = user?.model_permissions?.add_namespace ? (
      <Button variant='primary' onClick={() => this.handleModalToggle()}>
        {t`Create`}
      </Button>
    ) : null;

    if (loading) {
      return (
        <section>
          <LoadingPageSpinner></LoadingPageSpinner>;
        </section>
      );
    }

    if (namespaces.length === 0) {
      return (
        <section>
          {filterIsSet(this.state.params, ['keywords']) ? (
            <EmptyStateFilter />
          ) : (
            <EmptyStateNoData
              title={noDataTitle}
              description={noDataDescription}
              button={noDataButton}
            />
          )}
        </section>
      );
    }

    return (
      <section className='card-layout'>
        {namespaces.map((ns, i) => (
          <div key={i} className='card-wrapper'>
            <NamespaceCard
              namespaceURL={formatPath(namespacePath, {
                namespace: ns.name,
                repo: this.context.selectedRepo,
              })}
              key={i}
              menu={this.renderPageControls(ns)}
              {...ns}
            ></NamespaceCard>
          </div>
        ))}
      </section>
    );
  }

  private loadNamespaces() {
    const { filterOwner } = this.props;
    const api = filterOwner ? MyNamespaceAPI : NamespaceAPI;

    this.setState({ loading: true }, () => {
      api
        .list(this.state.params)
        .then((results) => {
          this.setState({
            namespaces: results.data.data,
            itemCount: results.data.meta.count,
            loading: false,
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'danger',
                  title: t`Namespaces list could not be displayed.`,
                  description: errorMessage(status, statusText),
                },
              ]),
          );
        });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonURLParams);
  }

  private closeAlert() {
    this.context.setAlerts([]);
  }

  private renderPageControls(namespace) {
    const dropdownItems = [
      <DropdownItem
        key='1'
        component={
          <Link
            to={formatPath(Paths.editNamespace, {
              namespace: namespace.name,
            })}
          >
            {t`Edit namespace`}
          </Link>
        }
      />,
      this.context.user.model_permissions.delete_namespace && (
        <React.Fragment key={'2'}>
          <DropdownItem onClick={() => this.tryDeleteNamespace(namespace)}>
            {t`Delete namespace`}
          </DropdownItem>
        </React.Fragment>
      ),
      <DropdownItem
        key='3'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: namespace.name,
              },
            )}
          >
            {t`Imports`}
          </Link>
        }
      />,

      <DropdownItem
        key='sign-collections'
        onClick={() => this.trySignAllCertificates(namespace)}
      >
        {t`Sign all collections`}
      </DropdownItem>,

      <DropdownItem onClick={() => this.tryUploadCollection(namespace)}>
        {t`Upload collection`}
      </DropdownItem>,
    ].filter(Boolean);

    return (
      <>
        {!this.state.showControls && (
          <div className='hub-namespace-page-controls'></div>
        )}
        <div className='hub-namespace-page-controls' data-cy='kebab-toggle'>
          {dropdownItems.length > 0 && (
            <StatefulDropdown items={dropdownItems} />
          )}
        </div>
      </>
    );
  }

  private tryUploadCollection(namespace) {
    this.setState({
      selectedNamespace: namespace,
      showImportModal: true,
    });
  }

  private toggleImportModal(isOpen: boolean, warning?: string) {
    const newState = { showImportModal: isOpen };
    if (warning) {
      newState['warning'] = warning;
    }

    if (!isOpen) {
      newState['updateCollection'] = null;
    }

    this.setState(newState);
  }

  private trySignAllCertificates(namespace: NamespaceListType) {
    this.loadNamespace(namespace, () => {
      if (this.state.canSign) {
        this.setState({
          selectedNamespace: namespace,
          isOpenSignModal: true,
        });
      } else {
        this.context.setAlerts([
          ...this.context.alerts,
          {
            variant: 'warning',
            title: t`Namespace "${namespace.name}" could not be signed.`,
            description: 'TODO',
          },
        ]);
      }
    });
  }

  private signAllCertificates(namespace: NamespaceListType) {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`API Error: ${status}`,
      description: t`Failed to sign all collections.`,
    });

    this.context.setAlerts([
      ...this.context.alerts,
      {
        id: 'loading-signing',
        variant: 'success',
        title: t`Signing started for all collections in namespace "${namespace.name}".`,
      },
    ]);
    this.setState({ isOpenSignModal: false });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      distro_base_path: this.context.selectedRepo,
      namespace: namespace.name,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            this.loadAll();
          })
          .catch((error) => {
            this.context.setAlerts([...this.context.alerts, errorAlert(error)]);
          })
          .finally(() => {
            this.context.setAlerts([
              this.context.alerts.filter((x) => x?.id !== 'loading-signing'),
            ]);
          });
      })
      .catch((error) => {
        // The request failed in the first place
        this.context.setAlerts([
          ...this.context.alerts,
          errorAlert(error.response.status),
        ]);
      });
  }

  private loadNamespace(namespace, callback) {
    Promise.all([
      CollectionAPI.list(
        {
          ...ParamHelper.getReduced({ namespace: namespace.name }, ['tab']),
        },
        this.context.selectedRepo,
      ),
      NamespaceAPI.get(namespace.name),
      MyNamespaceAPI.get(namespace.name, {
        include_related: 'my_permissions',
      }).catch((e) => {
        // TODO this needs fixing on backend to return nothing in these cases with 200 status
        // if view only mode is enabled disregard errors and hope
        if (
          this.context.user.is_anonymous &&
          this.context.settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS
        ) {
          return null;
        }
        // expecting 404 - it just means we can not edit the namespace (unless both NamespaceAPI and MyNamespaceAPI fail)
        return e.response && e.response.status === 404
          ? null
          : Promise.reject(e);
      }),
    ])
      .then((val) => {
        this.setState({
          collections: val[0].data.data,
          itemCount: val[0].data.meta.count,
          showControls: !!val[2],
          canSign: canSignNS(this.context, val[2]?.data),
        });

        this.loadAllRepos(namespace, val[0].data.meta.count, callback);
      })
      .catch(() => {
        this.setState({ redirect: Paths.notFound });
      });
  }

  private loadAllRepos(namespace, currentRepoCount, callback) {
    // get collections in namespace from each repo
    // except the one we already have
    const repoPromises = Object.keys(Constants.REPOSITORYNAMES)
      .filter((repo) => repo !== this.context.selectedRepo)
      .map((repo) => CollectionAPI.list({ namespace: namespace }, repo));

    Promise.all(repoPromises)
      .then((results) => {
        this.setState({
          isNamespaceEmpty:
            results.every((val) => val.data.meta.count === 0) &&
            currentRepoCount === 0,
        });
        callback();
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        this.context.setAlerts({
          alerts: [
            ...this.context.alerts,
            {
              variant: 'danger',
              title: t`Collection repositories could not be displayed.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private tryDeleteNamespace(namespace) {
    this.loadNamespace(namespace, () => {
      if (this.state.isNamespaceEmpty) {
        this.setState({
          selectedNamespace: namespace,
          isOpenNamespaceModal: true,
        });
      } else {
        this.context.setAlerts([
          ...this.context.alerts,
          {
            variant: 'warning',
            title: t`Namespace "${namespace.name}" could not be deleted.`,
            description: t`Namespace contains collections.`,
          },
        ]);
      }
    });
  }

  private deleteNamespace() {
    const namespace = this.state.selectedNamespace;
    this.setState({ isNamespacePending: true }, () =>
      NamespaceAPI.delete(namespace.name)
        .then(() => {
          this.setState({
            confirmDelete: false,
            isNamespacePending: false,
            isOpenNamespaceModal: false,
          });
          this.context.setAlerts([
            ...this.context.alerts,
            {
              variant: 'success',
              title: (
                <Trans>
                  Namespace &quot;{namespace.name}&quot; has been successfully
                  deleted.
                </Trans>
              ),
            },
          ]);
          this.loadAll();
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            isOpenNamespaceModal: false,
            confirmDelete: false,
            isNamespacePending: false,
          });

          this.context.setAlerts([
            ...this.context.alerts,
            {
              variant: 'danger',
              title: t`Namespace "${namespace.name}" could not be deleted.`,
              description: errorMessage(status, statusText),
            },
          ]);
        }),
    );
  }
}

NamespaceList.contextType = AppContext;
