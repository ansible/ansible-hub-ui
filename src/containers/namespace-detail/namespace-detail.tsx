import * as React from 'react';

import { RouteComponentProps, Redirect, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Button,
  DropdownItem,
  Alert,
  AlertActionCloseButton,
  ClipboardCopy,
} from '@patternfly/react-core';

import * as ReactMarkdown from 'react-markdown';

import {
  CollectionListType,
  CollectionAPI,
  NamespaceAPI,
  NamespaceType,
} from '../../api';

import {
  CollectionList,
  PartnerHeader,
  StatefulDropdown,
  LoadingPageWithHeader,
  Main,
  APIButton,
} from '../../components';

import { ImportModal } from './import-modal/import-modal';

import { ParamHelper, getRepoUrl } from '../../utilities';
import { Paths, formatPath } from '../../paths';
import { AppContext } from '../../loaders/app-context';

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
}

interface IProps extends RouteComponentProps {
  showControls: boolean;
  breadcrumbs: { name: string; url?: string }[];
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

    const { breadcrumbs } = this.props;

    if (redirect) {
      return <Redirect to={redirect} />;
    }

    if (!namespace) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const tabs = ['Collections'];

    if (this.props.showControls) {
      tabs.push('CLI Configuration');
    }
    const tab = params['tab'] || 'collections';

    if (namespace.resources) {
      tabs.push('Resources');
    }

    const repositoryUrl = getRepoUrl('inbound-' + namespace.name);

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
          breadcrumbs={breadcrumbs.concat([{ name: namespace.name }])}
          tabs={tabs}
          params={params}
          updateParams={p => this.updateParams(p)}
          pageControls={this.renderPageControls()}
        ></PartnerHeader>
        <Main>
          <Section className='body'>
            {tab.toLowerCase() === 'collections' ? (
              <CollectionList
                updateParams={params =>
                  this.updateParams(params, () => this.loadCollections())
                }
                params={params}
                collections={collections}
                itemCount={itemCount}
                showControls={this.props.showControls}
                handleControlClick={(id, action) =>
                  this.handleCollectionAction(id, action)
                }
                repo={this.context.selectedRepo}
              />
            ) : null}
            {tab.toLowerCase() === 'cli configuration' ? (
              <div>
                <ClipboardCopy isReadOnly>{repositoryUrl}</ClipboardCopy>
                <div>
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
                </div>
              </div>
            ) : null}
            {tab.toLowerCase() === 'resources'
              ? this.renderResources(namespace)
              : null}
          </Section>
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
              warning: 'API Error: Failed to set deprecation.',
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
    ])
      .then(val => {
        this.setState({
          collections: val[0].data.data,
          itemCount: val[0].data.meta.count,
          namespace: val[1].data,
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
    if (!this.props.showControls) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <APIButton style={{ marginLeft: '8px' }} />
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => this.setState({ showImportModal: true })}>
          Upload collection
        </Button>
        <APIButton style={{ marginLeft: '8px' }} />
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
