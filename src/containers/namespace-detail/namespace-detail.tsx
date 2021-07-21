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
  ClipboardCopy,
  DropdownItem,
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
} from 'src/components';

import { ImportModal } from './import-modal/import-modal';

import { ParamHelper, getRepoUrl, filterIsSet } from 'src/utilities';
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
    };
  }

  componentDidMount() {
    this.loadAll();
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
    } = this.state;

    if (redirect) {
      return <Redirect to={redirect} />;
    }

    if (!namespace) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const tabs = [_`Collections`];

    if (this.state.showControls) {
      tabs.push(_`CLI Configuration`);
    }
    const tab = params['tab'] || 'collections';

    if (namespace.resources) {
      tabs.push(_`Resources`);
    }

    const repositoryUrl = getRepoUrl('inbound-' + namespace.name);

    const noData = itemCount === 0 && !filterIsSet(params, ['keywords']);

    const updateParams = params =>
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
          onUploadSuccess={result =>
            this.props.history.push(
              formatPath(
                Paths.myImports,
                {},
                {
                  namespace: namespace.name,
                },
              ),
            )
          }
          // onCancel
          setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
          collection={updateCollection}
          namespace={namespace.name}
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
          updateParams={p => this.updateParams(p)}
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
                title={_`No collections yet`}
                description={_`Collections will appear once uploaded`}
                button={
                  this.state.showControls && (
                    <Button
                      onClick={() => this.setState({ showImportModal: true })}
                    >
                      Upload collection
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
          {tab.toLowerCase() === 'cli configuration' ? (
            <section className='body'>
              <div>
                <ClipboardCopy isReadOnly>{repositoryUrl}</ClipboardCopy>
                <div>
                  <b>{_`Note:`}</b> Use this URL to configure ansible-galaxy to
                  upload collections to this namespace. More information on
                  ansible-galaxy configurations can be found{' '}
                  <a
                    href='https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client'
                    target='_blank'
                  >
                    here
                  </a>
                  .
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
    const collection = this.state.collections.find(x => x.id === id);

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
          .catch(error => {
            this.setState({
              warning: _`API Error: Failed to set deprecation.`,
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
    ).then(result => {
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
      MyNamespaceAPI.get(this.props.match.params['namespace']).catch(
        // expecting 404 - it just means we can not edit the namespace (unless both NamespaceAPI and MyNamespaceAPI fail)
        e =>
          e.response && e.response.status === 404 ? null : Promise.reject(e),
      ),
    ])
      .then(val => {
        this.setState({
          collections: val[0].data.data,
          itemCount: val[0].data.meta.count,
          namespace: val[1].data,
          showControls: !!val[2],
        });
      })
      .catch(response => {
        this.setState({ redirect: Paths.notFound });
      });
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
            Upload collection
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
                  Edit namespace
                </Link>
              }
            />,
            <DropdownItem
              key='2'
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
                  Imports
                </Link>
              }
            />,
          ]}
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
}

NamespaceDetail.contextType = AppContext;

export default withRouter(NamespaceDetail);
