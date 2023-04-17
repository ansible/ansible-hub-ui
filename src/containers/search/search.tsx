import { t } from '@lingui/macro';
import { Button, DataList, DropdownItem, Switch } from '@patternfly/react-core';
import cx from 'classnames';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
  MyNamespaceAPI,
  MySyncListAPI,
  SyncListType,
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
  RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  waitForTask,
  withRouter,
} from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
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
  synclist: SyncListType;
  alerts: AlertType[];
  updateCollection: CollectionVersionSearch;
  showImportModal: boolean;
  redirect: string;
  noDependencies: boolean;
  deleteCollection: CollectionVersionSearch;
  confirmDelete: boolean;
  isDeletionPending: boolean;
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
      synclist: undefined,
      alerts: [],
      updateCollection: null,
      showImportModal: false,
      redirect: null,
      noDependencies: false,
      deleteCollection: null,
      confirmDelete: false,
      isDeletionPending: false,
    };
  }

  componentDidMount() {
    this.load();
  }

  private load() {
    this.queryCollections();

    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      this.getSynclist();
    }
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
              }),
            )
          }
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
        <BaseHeader className='header' title={t`Collections`}>
          {!noData && (
            <div className='hub-toolbar-wrapper'>
              <div className='toolbar'>
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
              footer={this.renderSyncToogle(
                c.collection_version.name,
                c.collection_version.namespace,
              )}
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
    const menuItems = [
      DeleteCollectionUtils.deleteMenuOption({
        canDeleteCollection: hasPermission('ansible.delete_collection'),
        noDependencies: null,
        onClick: () =>
          DeleteCollectionUtils.tryOpenDeleteModalWithConfirm({
            addAlert: (alert) => this.addAlert(alert),
            setState: (state) => this.setState(state),
            collection,
          }),
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

  private renderSyncToogle(name: string, namespace: string): React.ReactNode {
    const { synclist } = this.state;

    if (!synclist) {
      return null;
    }

    return (
      <Switch
        id={namespace + '.' + name}
        className='sync-toggle'
        label={t`Sync`}
        isChecked={this.isCollectionSynced(name, namespace)}
        onChange={() => this.toggleCollectionSync(name, namespace)}
      />
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

  private toggleCollectionSync(name: string, namespace: string) {
    const synclist = { ...this.state.synclist };

    const colIndex = synclist.collections.findIndex(
      (el) => el.name === name && el.namespace === namespace,
    );

    if (colIndex < 0) {
      synclist.collections.push({ name: name, namespace: namespace });
    } else {
      synclist.collections.splice(colIndex, 1);
    }

    MySyncListAPI.update(synclist.id, synclist).then((response) => {
      this.setState({ synclist: response.data });
      MySyncListAPI.curate(synclist.id).then(() => null);
    });
  }

  private isCollectionSynced(name: string, namespace: string): boolean {
    const { synclist } = this.state;
    const found = synclist.collections.find(
      (el) => el.name === name && el.namespace === namespace,
    );

    return synclist.policy === 'include' ? !!found : !found;
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
                synclistSwitch={this.renderSyncToogle(
                  c.collection_version.name,
                  c.collection_version.namespace,
                )}
                {...this.renderMenu(true, c)}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
  }

  private getSynclist() {
    MySyncListAPI.list().then((result) => {
      // ignore results if more than 1 is returned
      // TODO: should we throw an error for this or just ignore it?
      if (result.data.meta.count === 1) {
        this.setState({ synclist: result.data.data[0] });
      } else {
        console.error(
          `my-synclist returned ${result.data.meta.count} synclists`,
        );
      }
    });
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
