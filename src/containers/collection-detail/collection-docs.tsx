import { t } from '@lingui/macro';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import React, { Component, type RefObject, createRef } from 'react';
import { Link } from 'react-router';
import { type CollectionVersionSearch } from 'src/api';
import {
  Alert,
  CollectionHeader,
  EmptyStateCustom,
  ExternalLink,
  LoadingPage,
  Main,
  RenderPluginDoc,
  TableOfContents,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  sanitizeDocsUrls,
  withRouter,
} from 'src/utilities';
import { type IBaseCollectionState, loadCollection } from './base';
import './collection-detail.scss';

// renders markdown files in collection docs/ directory
class CollectionDocs extends Component<RouteProps, IBaseCollectionState> {
  static contextType = AppContext;

  docsRef: RefObject<HTMLDivElement>;
  searchBarRef: RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      actuallyCollection: null,
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
      params,
    };
    this.docsRef = createRef();
    this.searchBarRef = createRef();
  }

  componentDidMount() {
    this.loadCollection(false);
  }

  render() {
    const {
      actuallyCollection,
      collection,
      collections,
      collectionsCount,
      content,
      params,
    } = this.state;
    const urlFields = this.props.routeParams;

    if (!collection || !content) {
      return <LoadingPage />;
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

    const { collection_version, repository } = collection;

    const breadcrumbs = [
      namespaceBreadcrumb(),
      {
        url: formatPath(Paths.namespaceDetail, {
          namespace: collection_version.namespace,
        }),
        name: collection_version.namespace,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection_version.namespace,
          collection: collection_version.name,
          repo: repository.name,
        }),
        name: collection_version.name,
      },
      { name: t`Documentation` },
    ];

    return (
      <>
        <CollectionHeader
          activeTab='documentation'
          actuallyCollection={actuallyCollection}
          breadcrumbs={breadcrumbs}
          collection={collection}
          collections={collections}
          collectionsCount={collectionsCount}
          content={content}
          params={params}
          reload={() => this.loadCollection(true)}
          updateParams={(p) =>
            this.updateParams(p, () => this.loadCollection(true))
          }
        />
        <Main className='hub-docs-main'>
          <section className='hub-docs-container'>
            <TableOfContents
              className='hub-docs-sidebar'
              namespace={collection.collection_version.namespace}
              collection={collection.collection_version.name}
              repository={collection.repository.name}
              docs_blob={content.docs_blob}
              selectedName={contentName}
              selectedType={contentType}
              params={params}
              updateParams={(p) => this.updateParams(p)}
              searchBarRef={this.searchBarRef}
            />

            <div
              className='body hub-docs-content pf-v5-c-content hub-content-alert-fix'
              ref={this.docsRef}
            >
              {displayHTML || pluginData ? (
                // if neither variable is set, render not found
                displayHTML ? (
                  // if displayHTML is set, render it
                  <div
                    dangerouslySetInnerHTML={{
                      __html: displayHTML,
                    }}
                  />
                ) : (
                  // if plugin data is set render it
                  <RenderPluginDoc
                    plugin={pluginData}
                    renderPluginLink={(pluginName, pluginType, text) =>
                      this.renderPluginLink(
                        pluginName,
                        pluginType,
                        text ?? pluginName,
                        collection,
                        params,
                        content.contents,
                      )
                    }
                    renderDocLink={(name, href) =>
                      this.renderDocLink(name, href, collection, params)
                    }
                    renderTableOfContentsLink={(title, section) => (
                      <a href={'#' + section}>{title}</a>
                    )}
                    renderWarning={(text) => (
                      <Alert isInline variant='warning' title={text} />
                    )}
                  />
                )
              ) : collection.repository.name === 'community' &&
                !content.docs_blob.contents ? (
                this.renderCommunityWarningMessage()
              ) : (
                this.renderNotFound(collection.collection_version.name)
              )}
            </div>
          </section>
        </Main>
      </>
    );
  }

  private renderDocLink(
    name,
    href,
    collection: CollectionVersionSearch,
    params,
  ) {
    if (!!href && href.startsWith('http')) {
      return <ExternalLink href={href}>{name}</ExternalLink>;
    } else if (href) {
      // TODO: right now this will break if people put
      // ../ at the front of their urls. Need to find a
      // way to document this

      const { collection_version, repository } = collection;

      return (
        <Link
          to={formatPath(
            Paths.collectionDocsPageByRepo,
            {
              namespace: collection_version.namespace,
              collection: collection_version.name,
              page: sanitizeDocsUrls(href),
              repo: repository.name,
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

  private renderPluginLink(
    pluginName,
    pluginType,
    text,
    collection,
    params,
    allContent,
  ) {
    const module = allContent.find(
      (x) => x.content_type === pluginType && x.name === pluginName,
    );

    if (module) {
      return (
        <Link
          to={formatPath(
            Paths.collectionContentDocsByRepo,
            {
              namespace: collection.collection_version.namespace,
              collection: collection.collection_version.name,
              type: pluginType,
              name: pluginName,
              repo: this.props.routeParams.repo,
            },
            params,
          )}
        >
          {text}
        </Link>
      );
    } else {
      return text;
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
      setCollection: (
        collections,
        collection,
        content,
        collectionsCount,
        actuallyCollection,
      ) =>
        this.setState({
          collections,
          collection,
          content,
          collectionsCount,
          actuallyCollection,
        }),
      stateParams: this.state.params,
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

export default withRouter(CollectionDocs);
