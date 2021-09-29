import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './namespace-detail.scss';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  DropdownItem,
  Tooltip,
  Text,
  Checkbox,
} from '@patternfly/react-core';

import * as ReactMarkdown from 'react-markdown';

import {
  CollectionListType,
  CollectionAPI,
  NamespaceAPI,
  MyNamespaceAPI,
  NamespaceType,
} from 'src/api';

import {
  CollectionList,
  CollectionFilter,
  LoadingPageWithHeader,
  Main,
  Pagination,
  PartnerHeader,
  EmptyStateNoData,
  RepoSelector,
  StatefulDropdown,
  ClipboardCopy,
  AlertType,
  AlertList,
  closeAlertMixin,
  ConfirmModal,
} from 'src/components';

import { ImportModal } from './import-modal/import-modal';

import { ParamHelper, getRepoUrl, filterIsSet } from 'src/utilities';
import { Constants } from 'src/constants';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  collections: CollectionListType[];
  namespace: NamespaceType;
  params: {
    sort?: string;
    page?: number;
    page_size?: number;
    tab?: string;
    keywords?: string;
    namespace?: string;
  };
  redirect: string;
  itemCount: number;
  showImportModal: boolean;
  warning: string;
  updateCollection: CollectionListType;
  showControls: boolean;
  isOpenNamespaceModal: boolean;
  alerts: AlertType[];
  isNamespaceEmpty: boolean;
  confirmDelete: boolean;
}

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}

export class NamespaceDetail extends React.Component<IProps, IState> {
  nonAPIParams = ['tab'];

  // namespace is a positional url argument, so don't include it in the
  // query params
  nonQueryStringParams = ['namespace'];

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    params['namespace'] = props.match.params['namespace'];

    this.state = {
      collections: [],
      namespace: null,
      params: params,
      redirect: null,
      itemCount: 0,
      showImportModal: false,
      warning: '',
      updateCollection: null,
      showControls: false, // becomes true when my-namespaces doesn't 404
      isOpenNamespaceModal: false,
      alerts: [],
      isNamespaceEmpty: false,
      confirmDelete: false,
    };
  }

  componentDidMount() {
    this.loadAll();

    if (this.context.alerts) this.setState({ alerts: this.context.alerts });
  }

  componentWillUnmount() {
    this.context.setAlerts([]);
  }

  render() {
    const {
      collections,
      namespace,
      params,
      redirect,
      itemCount,
      showImportModal,
      warning,
      updateCollection,
      isOpenNamespaceModal,
      confirmDelete,
    } = this.state;

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    if (!namespace) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const tabs = [{ id: 'collections', name: t`Collections` }];

    if (this.state.showControls) {
      tabs.push({ id: 'cli-configuration', name: t`CLI Configuration` });
    }
    const tab = params['tab'] || 'collections';

    if (namespace.resources) {
      tabs.push({ id: 'resources', name: t`Resources` });
    }

    const repositoryUrl = getRepoUrl('inbound-' + namespace.name);

    const noData = itemCount === 0 && !filterIsSet(params, ['keywords']);

    const updateParams = (params) =>
      this.updateParams(params, () => this.loadCollections());

    const ignoredParams = [
      'namespace',
      'page',
      'page_size',
      'sort',
      'tab',
      'view_type',
    ];

    return (
      <React.Fragment>
        <ImportModal
          isOpen={showImportModal}
          onUploadSuccess={(result) =>
            this.setState({
              redirect: formatPath(
                Paths.myImports,
                {},
                {
                  namespace: namespace.name,
                },
              ),
            })
          }
          // onCancel
          setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
          collection={updateCollection}
          namespace={namespace.name}
        />
        {isOpenNamespaceModal && (
          <ConfirmModal
            cancelAction={this.closeModal}
            confirmAction={this.deleteNamespace}
            title={t`Permanently delete namespace?`}
            confirmButtonTitle={t`Delete`}
            isDisabled={!confirmDelete}
          >
            <>
              <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
                <Trans>
                  Deleting <b>{namespace.name}</b> and its data will be lost.
                </Trans>
              </Text>
              <Checkbox
                isChecked={confirmDelete}
                onChange={(val) => this.setState({ confirmDelete: val })}
                label={t`I understand that this action cannot be undone.`}
                id='delete_confirm'
              />
            </>
          </ConfirmModal>
        )}
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {warning ? (
          <Alert
            style={{
              position: 'fixed',
              right: '5px',
              top: '80px',
              zIndex: 300,
            }}
            variant='warning'
            title={warning}
            actionClose={
              <AlertActionCloseButton
                onClose={() => this.setState({ warning: '' })}
              />
            }
          ></Alert>
        ) : null}
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={[namespaceBreadcrumb, { name: namespace.name }]}
          tabs={tabs}
          params={params}
          updateParams={(p) => this.updateParams(p)}
          pageControls={this.renderPageControls()}
          contextSelector={
            <RepoSelector
              selectedRepo={this.context.selectedRepo}
              path={this.props.match.path as any} // Paths.namespaceByRepo or Paths.myCollectionsByRepo
              pathParams={{ namespace: namespace.name }}
            />
          }
          filters={
            tab.toLowerCase() === 'collections' ? (
              <div className='toolbar-wrapper namespace-detail'>
                <div className='toolbar'>
                  <CollectionFilter
                    ignoredParams={ignoredParams}
                    params={params}
                    updateParams={updateParams}
                  />

                  <div className='pagination-container'>
                    <Pagination
                      params={params}
                      updateParams={updateParams}
                      count={itemCount}
                      isTop
                    />
                  </div>
                </div>
              </div>
            ) : null
          }
        ></PartnerHeader>
        <Main>
          {tab.toLowerCase() === 'collections' ? (
            noData ? (
              <EmptyStateNoData
                title={t`No collections yet`}
                description={t`Collections will appear once uploaded`}
                button={
                  this.state.showControls && (
                    <Button
                      onClick={() => this.setState({ showImportModal: true })}
                    >
                      {t`Upload collection`}
                    </Button>
                  )
                }
              />
            ) : (
              <section className='body'>
                <CollectionList
                  updateParams={updateParams}
                  params={params}
                  ignoredParams={ignoredParams}
                  collections={collections}
                  itemCount={itemCount}
                  showControls={this.state.showControls}
                  handleControlClick={(id, action) =>
                    this.handleCollectionAction(id, action)
                  }
                  repo={this.context.selectedRepo}
                />
              </section>
            )
          ) : null}
          {tab.toLowerCase() === 'cli-configuration' ? (
            <section className='body'>
              <div>
                <ClipboardCopy isReadOnly>{repositoryUrl}</ClipboardCopy>
                <div>
                  <Trans>
                    <b>Note:</b> Use this URL to configure ansible-galaxy to
                    upload collections to this namespace. More information on
                    ansible-galaxy configurations can be found{' '}
                    <a
                      href='https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client'
                      target='_blank'
                    >
                      here
                    </a>
                    .
                  </Trans>
                </div>
              </div>
            </section>
          ) : null}
          {tab.toLowerCase() === 'resources'
            ? this.renderResources(namespace)
            : null}
        </Main>
      </React.Fragment>
    );
  }

  private handleCollectionAction(id, action) {
    const collection = this.state.collections.find((x) => x.id === id);

    switch (action) {
      case 'upload':
        this.setState({
          updateCollection: collection,
          showImportModal: true,
        });
        break;
      case 'deprecate':
        CollectionAPI.setDeprecation(
          collection,
          !collection.deprecated,
          this.context.selectedRepo,
        )
          .then(() => this.loadCollections())
          .catch((error) => {
            this.setState({
              warning: t`API Error: Failed to set deprecation.`,
            });
          });
        break;
    }
  }

  private renderResources(namespace: NamespaceType) {
    return (
      <div className='pf-c-content preview'>
        <ReactMarkdown source={namespace.resources} />
      </div>
    );
  }

  private loadCollections() {
    CollectionAPI.list(
      {
        ...ParamHelper.getReduced(this.state.params, this.nonAPIParams),
      },
      this.context.selectedRepo,
    ).then((result) => {
      this.setState({
        collections: result.data.data,
        itemCount: result.data.meta.count,
      });
    });
  }

  private loadAll() {
    Promise.all([
      CollectionAPI.list(
        {
          ...ParamHelper.getReduced(this.state.params, this.nonAPIParams),
        },
        this.context.selectedRepo,
      ),
      NamespaceAPI.get(this.props.match.params['namespace']),
      MyNamespaceAPI.get(this.props.match.params['namespace']).catch((e) => {
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
          namespace: val[1].data,
          showControls: !!val[2],
        });

        this.loadAllRepos(val[0].data.meta.count);
      })
      .catch((response) => {
        this.setState({ redirect: Paths.notFound });
      });
  }

  private loadAllRepos(currentRepoCount) {
    // get collections in namespace from each repo
    // except the one we already have
    const repoPromises = Object.keys(Constants.REPOSITORYNAMES)
      .filter((repo) => repo !== this.context.selectedRepo)
      .map((repo) =>
        CollectionAPI.list(
          { namespace: this.props.match.params['namespace'] },
          repo,
        ),
      );

    Promise.all(repoPromises)
      .then((results) =>
        this.setState({
          isNamespaceEmpty:
            results.every((val) => val.data.meta.count === 0) &&
            currentRepoCount === 0,
        }),
      )
      .catch((err) =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: 'Error loading collection repositories',
              description: err?.message,
            },
          ],
        }),
      );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private renderPageControls() {
    const { collections } = this.state;
    if (!this.state.showControls) {
      return <div style={{ display: 'flex', alignItems: 'center' }}></div>;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {' '}
        {collections.length !== 0 && (
          <Button onClick={() => this.setState({ showImportModal: true })}>
            {t`Upload collection`}
          </Button>
        )}
        <StatefulDropdown
          items={[
            <DropdownItem
              key='1'
              component={
                <Link
                  to={formatPath(Paths.editNamespace, {
                    namespace: this.state.namespace.name,
                  })}
                >
                  {t`Edit namespace`}
                </Link>
              }
            />,
            this.context.user.model_permissions.delete_namespace && (
              <React.Fragment key={'2'}>
                {this.state.isNamespaceEmpty ? (
                  <DropdownItem
                    onClick={() =>
                      this.setState({ isOpenNamespaceModal: true })
                    }
                  >
                    {t`Delete namespace`}
                  </DropdownItem>
                ) : (
                  <Tooltip
                    isVisible={false}
                    content={
                      <Trans>
                        Cannot delete namespace until <br />
                        collections' dependencies have <br />
                        been deleted
                      </Trans>
                    }
                    position='left'
                  >
                    <DropdownItem
                      isDisabled
                    >{t`Delete namespace`}</DropdownItem>
                  </Tooltip>
                )}
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
                      namespace: this.state.namespace.name,
                    },
                  )}
                >
                  {t`Imports`}
                </Link>
              }
            />,
          ].filter(Boolean)}
        />
      </div>
    );
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

  private deleteNamespace = () => {
    NamespaceAPI.delete(this.state.namespace.name)
      .then(() => {
        this.setState({
          redirect: formatPath(Paths.namespaces, {}),
          confirmDelete: false,
        });
        this.context.setAlerts([
          ...this.context.alerts,
          {
            variant: 'success',
            title: t`Successfully deleted namespace.`,
          },
        ]);
      })
      .catch((e) => {
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error deleting namespace.`,
              description: e.message,
            },
          ],
          isOpenNamespaceModal: false,
          confirmDelete: false,
        });
      });
  };

  private closeModal = () => {
    this.setState({ isOpenNamespaceModal: false, confirmDelete: false });
  };

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

NamespaceDetail.contextType = AppContext;

export default withRouter(NamespaceDetail);
