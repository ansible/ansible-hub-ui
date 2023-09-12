import { t } from '@lingui/macro';
import { Button, DataList, DropdownItem } from '@patternfly/react-core';
import cx from 'classnames';
import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
  MyNamespaceAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  CardListSwitcher,
  CollectionCard,
  CollectionFilter,
  CollectionListItem,
  DeleteCollectionModal,
  EmptyStateFilter,
  EmptyStateNoData,
  ImportModal,
  LoadingPageSpinner,
  Pagination,
  StatefulDropdown,
  closeAlertMixin,
} from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  DeleteCollectionUtils,
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  waitForTask,
  withRouter,
} from 'src/utilities';
import './search.scss';

interface IState {
  collections: CollectionVersionSearch[];
  numberOfResults: number;
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

class Search extends React.Component<RouteProps, IState> {
  tags: string[];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = Constants.CARD_DEFAULT_PAGE_SIZE;
    }

    // Load view type from local storage if it's not set. This allows a
    // user's view type preference to persist
    if (!params['view_type']) {
      params['view_type'] = localStorage.getItem(
        Constants.SEARCH_VIEW_TYPE_LOCAL_KEY,
      );
    }

    this.state = {
      collections: [],
      params: params,
      numberOfResults: 0,
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

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const {
      loading,
      collections,
      params,
      numberOfResults,
      showImportModal,
      updateCollection,
      deleteCollection,
      confirmDelete,
      isDeletionPending,
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

    return (
      <div className='search-page'>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          collections={collections}
          isDeletionPending={isDeletionPending}
          confirmDelete={confirmDelete}
          setConfirmDelete={(confirmDelete) => this.setState({ confirmDelete })}
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
        <BaseHeader className='hub-header-bordered' title={t`Collections`}>
          {!noData && (
            <div>
              <div className='hub-toolbar hub-toolbar-left'>
                <CollectionFilter
                  ignoredParams={['page', 'page_size', 'sort', 'view_type']}
                  params={params}
                  updateParams={updateParams}
                />

                <div className='hub-pagination-container'>
                  <div className='card-list-switcher'>
                    <CardListSwitcher
                      size='sm'
                      params={params}
                      updateParams={(p) =>
                        this.updateParams(p, () =>
                          // Note, we have to use this.state.params instead
                          // of params in the callback because the callback
                          // executes before the page can re-run render
                          // which means params doesn't contain the most
                          // up to date state
                          localStorage.setItem(
                            Constants.SEARCH_VIEW_TYPE_LOCAL_KEY,
                            this.state.params.view_type,
                          ),
                        )
                      }
                    />
                  </div>

                  <Pagination
                    params={params}
                    updateParams={updateParams}
                    count={numberOfResults}
                    perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                    isTop
                  />
                </div>
              </div>
            </div>
          )}
        </BaseHeader>
        {loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No collections yet`}
            description={t`Collections will appear once uploaded`}
          />
        ) : (
          <React.Fragment>
            <section className='collection-container'>
              {this.renderCollections(collections, params, updateParams)}
            </section>
            <section className='footer'>
              <Pagination
                params={params}
                updateParams={(p) =>
                  this.updateParams(p, () => this.queryCollections())
                }
                perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                count={numberOfResults}
              />
            </section>
          </React.Fragment>
        )}
      </div>
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

  private renderCollections(collections, params, updateParams) {
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
      return this.renderCards(collections);
    }
  }

  private renderCards(collections) {
    return (
      <div className='hub-cards'>
        {collections.map((c, i) => {
          return (
            <CollectionCard
              className='card'
              key={i}
              {...c}
              menu={this.renderMenu(false, c)}
              displaySignatures={this.context.featureFlags.display_signatures}
            />
          );
        })}
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
                title: title,
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
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private renderMenu(list, collection) {
    const { hasPermission } = this.context;
    const { display_repositories } = this.context.featureFlags;

    const menuItems = [
      DeleteCollectionUtils.deleteMenuOption({
        canDeleteCollection: hasPermission('ansible.delete_collection'),
        noDependencies: null,
        onClick: () =>
          DeleteCollectionUtils.tryOpenDeleteModalWithConfirm({
            addAlert: (alert) => this.addAlert(alert),
            setState: (state) => this.setState(state),
            collection,
            deleteAll: true,
          }),
        deleteAll: true,
        display_repositories: display_repositories,
      }),
      DeleteCollectionUtils.deleteMenuOption({
        canDeleteCollection: hasPermission('ansible.delete_collection'),
        noDependencies: null,
        onClick: () =>
          DeleteCollectionUtils.tryOpenDeleteModalWithConfirm({
            addAlert: (alert) => this.addAlert(alert),
            setState: (state) => this.setState(state),
            collection,
            deleteAll: false,
          }),
        deleteAll: false,
        display_repositories: display_repositories,
      }),
      hasPermission('galaxy.upload_to_namespace') && (
        <DropdownItem
          onClick={() => this.handleControlClick(collection)}
          key='deprecate'
        >
          {collection.is_deprecated ? t`Undeprecate` : t`Deprecate`}
        </DropdownItem>
      ),
      !list && hasPermission('galaxy.upload_to_namespace') && (
        <DropdownItem
          onClick={() => this.checkUploadPrivilleges(collection)}
          key='upload new version'
        >
          {t`Upload new version`}
        </DropdownItem>
      ),
    ].filter(Boolean);

    const displayMenu = menuItems.length > 0;

    if (list) {
      return {
        uploadButton: hasPermission('galaxy.upload_to_namespace') ? (
          <Button
            onClick={() => this.checkUploadPrivilleges(collection)}
            variant='secondary'
          >
            {t`Upload new version`}
          </Button>
        ) : null,
        dropdownMenu: displayMenu ? (
          <StatefulDropdown items={menuItems} ariaLabel='collection-kebab' />
        ) : null,
      };
    }

    return (
      <span className={cx(!displayMenu && 'hidden-menu-space')}>
        {displayMenu && (
          <StatefulDropdown items={menuItems} ariaLabel='collection-kebab' />
        )}
      </span>
    );
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
                displaySignatures={this.context.featureFlags.display_signatures}
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
          numberOfResults: result.data.meta.count,
          loading: false,
        });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(Search);

Search.contextType = AppContext;
