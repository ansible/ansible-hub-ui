import * as React from 'react';
import './collection-detail.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { HashLink } from 'react-router-hash-link';

import { Alert } from '@patternfly/react-core';

import {
  CollectionHeader,
  TableOfContents,
  LoadingPageWithHeader,
  Main,
  EmptyStateCustom,
} from '../../components';

import { RenderPluginDoc } from '@ansible/galaxy-doc-builder';

import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper, sanitizeDocsUrls } from '../../utilities';
import { formatPath, Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';

import { ExclamationCircleIcon } from '@patternfly/react-icons';

// renders markdown files in collection docs/ directory
class CollectionDocs extends React.Component<
  RouteComponentProps,
  IBaseCollectionState
> {
  docsRef: any;

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: undefined,
      params: params,
    };

    this.docsRef = React.createRef();
  }

  componentDidMount() {
    this.loadCollection(this.context.selectedRepo);
  }

  render() {
    const { params, collection } = this.state;
    const urlFields = this.props.match.params;
    const name =
      NAMESPACE_TERM.charAt(0).toUpperCase() + NAMESPACE_TERM.slice(1);

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    // If the parser can't find anything that matches the URL, neither of
    // these variables should be set
    let displayHTML: string;
    let pluginData;

    const contentType = urlFields['type'] || 'docs';
    const contentName = urlFields['name'] || urlFields['page'] || null;

    if (contentType === 'docs' && contentName) {
      if (collection.latest_version.docs_blob.documentation_files) {
        const file = collection.latest_version.docs_blob.documentation_files.find(
          x => sanitizeDocsUrls(x.name) === urlFields['page'],
        );

        if (file) {
          displayHTML = file.html;
        }
      }
    } else if (contentName) {
      // check if contents exists
      if (collection.latest_version.docs_blob.contents) {
        const content = collection.latest_version.docs_blob.contents.find(
          x => x.content_type === contentType && x.content_name === contentName,
        );

        if (content) {
          if (contentType === 'role') {
            displayHTML = content['readme_html'];
          } else {
            pluginData = content;
          }
        }
      }
    } else {
      if (collection.latest_version.docs_blob.collection_readme) {
        displayHTML =
          collection.latest_version.docs_blob.collection_readme.html;
      }
    }

    const breadcrumbs = [
      { url: Paths[NAMESPACE_TERM], name: name },
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.namespace.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.namespace.name,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection.namespace.name,
          collection: collection.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.name,
      },
      { name: 'Documentation' },
    ];

    // scroll to top of page
    if (this.docsRef.current) {
      this.docsRef.current.scrollIntoView();
    }

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={p =>
            this.updateParams(p, () =>
              this.loadCollection(this.context.selectedRepo, true),
            )
          }
          breadcrumbs={breadcrumbs}
          activeTab='documentation'
          className='header'
          repo={this.context.selectedRepo}
        />
        <Main className='main'>
          <Section className='docs-container'>
            <TableOfContents
              className='sidebar'
              namespace={collection.namespace.name}
              collection={collection.name}
              docs_blob={collection.latest_version.docs_blob}
              selectedName={contentName}
              selectedType={contentType}
              params={params}
            ></TableOfContents>
            <div className='body docs pf-c-content' ref={this.docsRef}>
              {!(displayHTML || pluginData) ? (
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
                    renderModuleLink={moduleName =>
                      this.renderModuleLink(
                        moduleName,
                        collection,
                        params,
                        collection.latest_version.contents,
                      )
                    }
                    renderDocLink={(name, href) =>
                      this.renderDocLink(name, href, collection, params)
                    }
                    renderTableOfContentsLink={(title, section) => (
                      <HashLink to={'#' + section}>{title}</HashLink>
                    )}
                    renderWarning={text => (
                      <Alert isInline variant='warning' title={text} />
                    )}
                  />
                )
              ) : (
                this.renderNotFound(collection.name)
              )}
            </div>
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private renderDocLink(name, href, collection, params) {
    if (href.startsWith('http')) {
      return (
        <a href={href} target='_blank'>
          {name}
        </a>
      );
    } else {
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
    }
  }

  private renderModuleLink(moduleName, collection, params, allContent) {
    const module = allContent.find(
      x => x.content_type === 'module' && x.name === moduleName,
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
        title={'Not found'}
        description={
          'The file is not available for this version of ' + collectionName
        }
        icon={ExclamationCircleIcon}
      />
    );
  }

  get loadCollection() {
    return loadCollection;
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionDocs);

CollectionDocs.contextType = AppContext;
