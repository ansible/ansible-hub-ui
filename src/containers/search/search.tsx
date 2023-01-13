import { t } from '@lingui/macro';
import * as React from 'react';
import './search.scss';
import {
  errorMessage,
  DeleteCollectionUtils,
  filterIsSet,
  waitForTask,
  parsePulpIDFromURL,
} from 'src/utilities';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { DataList, DropdownItem, Button } from '@patternfly/react-core';
import {
  BaseHeader,
  CardListSwitcher,
  CollectionCard,
  CollectionFilter,
  CollectionListItem,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Pagination,
  RepoSelector,
  StatefulDropdown,
  AlertList,
  AlertType,
  closeAlertMixin,
  ImportModal,
  DeleteCollectionModal,
} from 'src/components';
import { CollectionAPI, CollectionListType, MyNamespaceAPI } from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';

interface IState {
  collections: CollectionListType[];
  numberOfResults: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
  loading: boolean;
  alerts: AlertType[];
  updateCollection: CollectionListType;
  showImportModal: boolean;
  redirect: string;
  noDependencies: boolean;
  deleteCollection: CollectionListType;
  confirmDelete: boolean;
  isDeletionPending: boolean;
}

class Search extends React.Component<RouteComponentProps, IState> {
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
      return <Redirect push to={this.state.redirect} />;
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
      !filterIsSet(params, ['keywords', 'tags', 'sign_state']);

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
                selectedRepo: this.context.selectedRepo,
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
                    namespace: updateCollection.namespace.name,
                  },
                ),
              })
            }
            // onCancel
            setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
            collection={updateCollection}
            namespace={updateCollection.namespace.name}
          />
        )}
        <BaseHeader
          className='header'
          title={t`Collections`}
          contextSelector={
            <RepoSelector
              selectedRepo={this.context.selectedRepo}
              path={Paths.searchByRepo}
            />
          }
        >
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
        {collections.map((c) => {
          return (
            <CollectionCard
              className='card'
              key={c.id}
              {...c}
              repo={this.context.selectedRepo}
              menu={this.renderMenu(false, c)}
              displaySignatures={this.context.featureFlags.display_signatures}
            />
          );
        })}
      </div>
    );
  }

  private handleControlClick(collection) {
    CollectionAPI.setDeprecation(
      collection,
      !collection.deprecated,
      this.context.selectedRepo,
    )
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.deprecated
            ? t`The collection "${collection.name}" has been successfully deprecated.`
            : t`The collection "${collection.name}" has been successfully undeprecated.`;
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
                ? t`Collection "${collection.name}" could not be deprecated.`
                : t`Collection "${collection.name}" could not be undeprecated.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private renderMenu(list, collection) {
    const menuItems = [
      DeleteCollectionUtils.deleteMenuOption({
        canDeleteCollection:
          this.context.user.model_permissions.delete_collection,
        noDependencies: null,
        onClick: () =>
          DeleteCollectionUtils.tryOpenDeleteModalWithConfirm({
            addAlert: (alert) => this.addAlert(alert),
            setState: (state) => this.setState(state),
            collection,
          }),
      }),
      <DropdownItem
        onClick={() => this.handleControlClick(collection)}
        key='deprecate'
      >
        {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
      </DropdownItem>,
    ];

    if (!list) {
      menuItems.push(
        <DropdownItem
          onClick={() => this.checkUploadPrivilleges(collection)}
          key='upload new version'
        >
          {t`Upload new version`}
        </DropdownItem>,
      );
    }

    return (
      <React.Fragment>
        {list && (
          <Button
            onClick={() => this.checkUploadPrivilleges(collection)}
            variant='secondary'
          >
            {t`Upload new version`}
          </Button>
        )}
        <StatefulDropdown
          items={menuItems.filter(Boolean)}
          ariaLabel='collection-kebab'
        />
      </React.Fragment>
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

    MyNamespaceAPI.get(collection.namespace.name, {
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
            {collections.map((c) => (
              <CollectionListItem
                showNamespace={true}
                key={c.id}
                {...c}
                controls={this.renderMenu(true, c)}
                repo={this.context.selectedRepo}
                displaySignatures={this.context.featureFlags.display_signatures}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
  }

  private queryCollections() {
    this.setState({ loading: true }, () => {
      CollectionAPI.list(
        {
          ...ParamHelper.getReduced(this.state.params, ['view_type']),
          deprecated: false,
        },
        this.context.selectedRepo,
      ).then((result) => {
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
