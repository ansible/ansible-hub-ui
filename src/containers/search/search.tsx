import { t } from '@lingui/macro';
import { Button, DataList } from '@patternfly/react-core';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CollectionAPI,
  CollectionVersionAPI,
  type CollectionVersionSearch,
  MyNamespaceAPI,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  CollectionCard,
  CollectionDropdown,
  CollectionListItem,
  CollectionNextPageCard,
  DeleteCollectionModal,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  ImportModal,
  LoadingSpinner,
  closeAlert,
  collectionFilter,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  DeleteCollectionUtils,
  ParamHelper,
  type RouteProps,
  filterIsSet,
  jsxErrorMessage,
  parsePulpIDFromURL,
  waitForTask,
  withRouter,
} from 'src/utilities';
import './search.scss';

interface IState {
  collections: CollectionVersionSearch[];
  count: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
    repository_name?: string;
    namespace?: string;
  };
  loading: boolean;
  alerts: AlertType[];
  updateCollection: CollectionVersionSearch;
  showImportModal: boolean;
  redirect: string;
  noDependencies: boolean;
  deleteCollection: CollectionVersionSearch;
  confirmDelete: boolean;
  isDeletionPending: boolean;
  deleteAll: boolean;
}

class Search extends Component<RouteProps, IState> {
  static contextType = AppContext;

  tags: string[];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    // Load view type from local storage if it's not set. This allows a
    // user's view type preference to persist
    if (!params['view_type']) {
      params['view_type'] = localStorage.getItem('search_view_type');
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      collections: [],
      params,
      count: 0,
      loading: true,
      alerts: [],
      updateCollection: null,
      showImportModal: false,
      redirect: null,
      noDependencies: false,
      deleteCollection: null,
      confirmDelete: false,
      isDeletionPending: false,
      deleteAll: true,
    };
  }

  componentDidMount() {
    this.load();
  }

  private load() {
    this.queryCollections();
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const {
      alerts,
      collections,
      confirmDelete,
      count,
      deleteCollection,
      isDeletionPending,
      loading,
      params,
      showImportModal,
      updateCollection,
    } = this.state;

    const noData =
      collections.length === 0 &&
      !filterIsSet(params, [
        'keywords',
        'tags',
        'is_signed',
        'repository_name',
        'namespace',
      ]);

    const updateParams = (p) =>
      this.updateParams(p, () => this.queryCollections());

    const deleteFromRepo = this.state.deleteAll
      ? null
      : deleteCollection?.repository?.name;

    const ignoredParams = ['page', 'page_size', 'sort', 'view_type'];

    return (
      <>
        <div className='hub-search-page'>
          <AlertList
            alerts={alerts}
            closeAlert={(i) =>
              closeAlert(i, {
                alerts,
                setAlerts: (alerts) => this.setState({ alerts }),
              })
            }
          />
          <DeleteCollectionModal
            deleteCollection={deleteCollection}
            collections={collections}
            isDeletionPending={isDeletionPending}
            confirmDelete={confirmDelete}
            setConfirmDelete={(confirmDelete) =>
              this.setState({ confirmDelete })
            }
            cancelAction={() => this.setState({ deleteCollection: null })}
            deleteAction={() =>
              this.setState({ isDeletionPending: true }, () =>
                DeleteCollectionUtils.deleteCollection({
                  collection: deleteCollection,
                  setState: (state) => this.setState(state),
                  load: () => this.load(),
                  redirect: false,
                  addAlert: (alert) => this.addAlert(alert),
                  deleteFromRepo,
                }),
              )
            }
            deleteFromRepo={deleteFromRepo}
          />

          {showImportModal && (
            <ImportModal
              isOpen={showImportModal}
              onUploadSuccess={() =>
                this.setState({
                  redirect: formatPath(
                    Paths.myImports,
                    {},
                    {
                      namespace: updateCollection.collection_version.namespace,
                    },
                  ),
                })
              }
              // onCancel
              setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
              collection={updateCollection.collection_version}
              namespace={updateCollection.collection_version.namespace}
            />
          )}
          <BaseHeader className='hub-header-bordered' title={t`Collections`} />
          {!noData && (
            <HubListToolbar
              count={count}
              ignoredParams={ignoredParams}
              params={params}
              switcher='search_view_type'
              updateParams={updateParams}
              {...collectionFilter({
                featureFlags: (this.context as IAppContextType).featureFlags,
                ignoredParams,
              })}
            />
          )}
          {loading ? (
            <LoadingSpinner />
          ) : noData ? (
            <EmptyStateNoData
              title={t`No collections yet`}
              description={t`Collections will appear once uploaded`}
            />
          ) : (
            <>
              <section className='collection-container'>
                {this.renderCollections(collections, {
                  count,
                  params,
                  updateParams,
                })}
              </section>
              <section className='footer'>
                <HubPagination
                  params={params}
                  updateParams={updateParams}
                  count={count}
                />
              </section>
            </>
          )}
        </div>
      </>
    );
  }

  private toggleImportModal(isOpen: boolean, warning?: string) {
    if (warning) {
      this.setState({
        alerts: [...this.state.alerts, { title: warning, variant: 'warning' }],
      });
    }
    this.setState({ showImportModal: isOpen });
  }

  private renderCollections(collections, { count, params, updateParams }) {
    if (collections.length === 0) {
      return (
        <EmptyStateFilter
          clearAllFilters={() => {
            ParamHelper.clearAllFilters({
              params,
              ignoredParams: ['page', 'page_size', 'sort', 'view_type'],
              updateParams,
            });
          }}
        />
      );
    }

    if (params.view_type === 'list') {
      return this.renderList(collections);
    } else {
      return this.renderCards(collections, {
        count,
        params,
        updateParams,
      });
    }
  }

  private renderCards(collections, { count, params, updateParams }) {
    return (
      <div className='hub-cards'>
        {collections.map((c, i) => {
          return (
            <CollectionCard
              key={i}
              {...c}
              menu={this.renderMenu(false, c)}
              displaySignatures={
                (this.context as IAppContextType).featureFlags
                  .display_signatures
              }
            />
          );
        })}
        {count > params.page_size * (params.page ?? 1) ? (
          <CollectionNextPageCard
            onClick={() =>
              updateParams({ ...params, page: (params.page ?? 1) + 1 })
            }
          />
        ) : null}
      </div>
    );
  }

  private handleControlClick(collection) {
    const { name } = collection.collection_version;
    CollectionAPI.setDeprecation(collection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.deprecated
            ? t`The collection "${name}" has been successfully deprecated.`
            : t`The collection "${name}" has been successfully undeprecated.`;
          this.setState({
            alerts: [
              ...this.state.alerts,
              {
                title,
                variant: 'success',
              },
            ],
          });
          this.load();
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: !collection.deprecated
                ? t`Collection "${name}" could not be deprecated.`
                : t`Collection "${name}" could not be undeprecated.`,
              description: jsxErrorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private renderMenu(list, collection) {
    const { hasPermission } = this.context as IAppContextType;
    const canUpload = hasPermission('galaxy.upload_to_namespace');

    const deleteFn = (deleteAll) => ({
      addAlert: (alert) => this.addAlert(alert),
      collection,
      openModal: () =>
        this.setState({
          deleteCollection: collection,
          confirmDelete: false,
          deleteAll,
        }),
    });

    const dropdownMenu = (
      <CollectionDropdown
        collection={collection}
        data-cy='collection-kebab'
        onDelete={deleteFn(true)}
        onDeprecate={() => this.handleControlClick(collection)}
        onRemove={deleteFn(false)}
        onUploadVersion={
          list ? null : () => this.checkUploadPrivilleges(collection)
        }
        wrapper={
          list
            ? null
            : ({ any, children }) =>
                any ? (
                  <span>{children}</span>
                ) : (
                  <span className='hidden-menu-space' />
                )
        }
      />
    );

    if (list) {
      return {
        uploadButton: canUpload ? (
          <Button
            onClick={() => this.checkUploadPrivilleges(collection)}
            variant='secondary'
          >
            {t`Upload new version`}
          </Button>
        ) : null,
        dropdownMenu,
      };
    }

    return dropdownMenu;
  }

  private checkUploadPrivilleges(collection) {
    const addAlert = () => {
      this.setState({
        alerts: [
          ...this.state.alerts,
          {
            title: t`You don't have rights to do this operation.`,
            variant: 'warning',
          },
        ],
      });
    };

    MyNamespaceAPI.get(collection.collection_version.namespace, {
      include_related: 'my_permissions',
    })
      .then((value) => {
        if (
          value.data.related_fields.my_permissions.includes(
            'galaxy.upload_to_namespace',
          )
        ) {
          this.setState({
            updateCollection: collection,
            showImportModal: true,
          });
        } else {
          addAlert();
        }
      })
      .catch(() => {
        addAlert();
      });
  }

  private renderList(collections) {
    return (
      <div className='list-container'>
        <div className='hub-list'>
          <DataList className='data-list' aria-label={t`List of Collections`}>
            {collections.map((c, i) => (
              <CollectionListItem
                key={i}
                collection={c}
                displaySignatures={
                  (this.context as IAppContextType).featureFlags
                    .display_signatures
                }
                showNamespace
                {...this.renderMenu(true, c)}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
  }

  private queryCollections() {
    this.setState({ loading: true }, () => {
      CollectionVersionAPI.list({
        ...ParamHelper.getReduced(this.state.params, ['view_type']),
        is_deprecated: false,
        repository_label: '!hide_from_search',
        is_highest: true,
      }).then((result) => {
        this.setState({
          collections: result.data.data,
          count: result.data.meta.count,
          loading: false,
        });
      });
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(Search);
