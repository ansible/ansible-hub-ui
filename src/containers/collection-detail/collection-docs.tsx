import { t } from '@lingui/macro';
import { Alert } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import {
  CollectionHeader,
  EmptyStateCustom,
  LoadingPageWithHeader,
  Main,
  RenderPluginDoc,
  TableOfContents,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper, sanitizeDocsUrls } from 'src/utilities';
import { IBaseCollectionState, loadCollection } from './base';
import './collection-detail.scss';

// renders markdown files in collection docs/ directory
class CollectionDocs extends React.Component<RouteProps, IBaseCollectionState> {
  docsRef: React.RefObject<HTMLDivElement>;
  searchBarRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collections: [],
      collection: null,
      content: null,
      params: params,
    };
    this.docsRef = React.createRef();
    this.searchBarRef = React.createRef();
  }

  componentDidMount() {
    this.loadCollection(false);
  }

  render() {
    const { params, collection, collections, content } = this.state;
    const urlFields = this.props.routeParams;

    if (!collection || !content) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    // If the parser can't find anything that matches the URL, neither of
    // these variables should be set
    let displayHTML: string;
    let pluginData;

    const contentType = urlFields['type'] || 'docs';
    const contentName = urlFields['name'] || urlFields['page'] || null;

    if (contentType === 'docs' && contentName) {
      if (content.docs_blob.documentation_files) {
        const file = content.docs_blob.documentation_files.find(
          (x) => sanitizeDocsUrls(x.name) === urlFields['page'],
        );

        if (file) {
          displayHTML = file.html;
        }
      }
    } else if (contentName) {
      // check if contents exists
      if (content.docs_blob.contents) {
        const selectedContent = content.docs_blob.contents.find(
          (x) =>
            x.content_type === contentType && x.content_name === contentName,
        );

        if (selectedContent) {
          if (contentType === 'role') {
            displayHTML = selectedContent['readme_html'];
          } else {
            pluginData = selectedContent;
          }
        }
      }
    } else {
      if (content.docs_blob.collection_readme) {
        displayHTML = content.docs_blob.collection_readme.html;
      }
    }

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.collection_version.namespace,
          repo: this.context.selectedRepo,
        }),
        name: collection.collection_version.namespace,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection.collection_version.namespace,
          collection: collection.collection_version.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.collection_version.name,
      },
      { name: t`Documentation` },
    ];

    // scroll to top of page

    // if (
    //   this.docsRef.current &&
    //   this.searchBarRef.current !== window.document.activeElement
    // ) {
    //   this.docsRef.current.scrollIntoView();
    // }

    return (
      <React.Fragment>
        <CollectionHeader
          reload={() => this.loadCollection(true)}
          collection={collection}
          collections={collections}
          content={content}
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () => this.loadCollection(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='documentation'
          className='header'
          repo={this.context.selectedRepo}
        />
        <Main className='main'>
          <section className='docs-container'>
            <TableOfContents
              className='sidebar'
              namespace={collection.collection_version.namespace}
              collection={collection.collection_version.name}
              docs_blob={content.docs_blob}
              selectedName={contentName}
              selectedType={contentType}
              params={params}
              updateParams={(p) => this.updateParams(p)}
              searchBarRef={this.searchBarRef}
            ></TableOfContents>

            <div className='body docs pf-c-content' ref={this.docsRef}>
              {displayHTML || pluginData ? (
                // if neither variable is set, render not found
                displayHTML ? (
                  // if displayHTML is set, render it
                  <div
                    dangerouslySetInnerHTML={{
                      __html: displayHTML,
                    }}
                  ></div>
                ) : (
                  // if plugin data is set render it
                  <RenderPluginDoc
                    plugin={pluginData}
                    renderModuleLink={(moduleName) =>
                      this.renderModuleLink(
                        moduleName,
                        collection,
                        params,
                        content.contents,
                      )
                    }
                    renderDocLink={(name, href) =>
                      this.renderDocLink(name, href, collection, params)
                    }
                    renderTableOfContentsLink={(title, section) => (
                      <HashLink to={'#' + section}>{title}</HashLink>
                    )}
                    renderWarning={(text) => (
                      <Alert isInline variant='warning' title={text} />
                    )}
                  />
                )
              ) : this.context.selectedRepo === 'community' &&
                !content.docs_blob.contents ? (
                this.renderCommunityWarningMessage()
              ) : (
                this.renderNotFound(collection.collection_version.name)
              )}
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private renderDocLink(name, href, collection, params) {
    if (!!href && href.startsWith('http')) {
      return (
        <a href={href} target='_blank' rel='noreferrer'>
          {name}
        </a>
      );
    } else if (href) {
      // TODO: right now this will break if people put
      // ../ at the front of their urls. Need to find a
      // way to document this
      return (
        <Link
          to={formatPath(
            Paths.collectionDocsPageByRepo,
            {
              namespace: collection.namespace.name,
              collection: collection.name,
              page: sanitizeDocsUrls(href),
              repo: this.context.selectedRepo,
            },
            params,
          )}
        >
          {name}
        </Link>
      );
    } else {
      return null;
    }
  }

  private renderModuleLink(moduleName, collection, params, allContent) {
    const module = allContent.find(
      (x) => x.content_type === 'module' && x.name === moduleName,
    );

    if (module) {
      return (
        <Link
          to={formatPath(
            Paths.collectionContentDocsByRepo,
            {
              namespace: collection.namespace.name,
              collection: collection.name,
              type: 'module',
              name: moduleName,
              repo: this.context.selectedRepo,
            },
            params,
          )}
        >
          {moduleName}
        </Link>
      );
    } else {
      return moduleName;
    }
  }

  private renderNotFound(collectionName) {
    return (
      <EmptyStateCustom
        title={t`Not found`}
        description={t`The file is not available for this version of ${collectionName}`}
        icon={ExclamationCircleIcon}
      />
    );
  }

  private renderCommunityWarningMessage() {
    return (
      <EmptyStateCustom
        title={t`Warning`}
        description={t`Community collections do not have docs nor content counts, but all content gets synchronized`}
        icon={ExclamationTriangleIcon}
      />
    );
  }

  private loadCollection(forceReload) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      selectedRepo: this.context.selectedRepo,
      setCollection: (collections, collection, content) => {
        this.setState({ collections, collection, content });
      },
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionDocs);

CollectionDocs.contextType = AppContext;
