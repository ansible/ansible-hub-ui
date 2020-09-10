import * as React from 'react';
import './collection-detail.scss';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { HashLink } from 'react-router-hash-link';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
  EmptyStateIcon,
  Alert,
} from '@patternfly/react-core';

import { WarningTriangleIcon } from '@patternfly/react-icons';

import {
  CollectionHeader,
  TableOfContents,
  LoadingPageWithHeader,
  Main,
} from '../../components';

import { RenderPluginDoc } from '@ansible/galaxy-doc-builder';

import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper, sanitizeDocsUrls } from '../../utilities';
import { formatPath, Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';
import { Constants } from '../../constants';

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
      repo: props.match.params.repo,
    };

    this.docsRef = React.createRef();
  }

  componentDidMount() {
    const { repo } = this.state;
    if (DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE) {
      if (!repo) {
        this.context.setRepo(Constants.DEAFAULTREPO);
        this.setState({ repo: Constants.DEAFAULTREPO });
      } else if (!Constants.ALLOWEDREPOS.includes(repo)) {
        this.setState({ redirect: true });
      } else if (
        repo !== Constants.REPOSITORYNAMES[this.context.selectedRepo]
      ) {
        const newRepoName = Object.keys(Constants.REPOSITORYNAMES).find(
          key => Constants.REPOSITORYNAMES[key] === repo,
        );
        this.context.setRepo(newRepoName);
        this.setState({ repo: newRepoName });
      }
    }

    this.loadCollection(this.context.selectedRepo);
  }

  render() {
    const { params, collection, redirect } = this.state;
    const urlFields = this.props.match.params;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (redirect) {
      return <Redirect to={Paths.notFound} />;
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
      { url: Paths.partners, name: 'Partners' },
      {
        url: formatPath(Paths.namespace, {
          namespace: collection.namespace.name,
        }),
        name: collection.namespace.name,
      },
      {
        url: formatPath(Paths.collection, {
          namespace: collection.namespace.name,
          collection: collection.name,
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
              repo: Constants.REPOSITORYNAMES[this.context.selectedRepo],
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
              repo: Constants.REPOSITORYNAMES[this.context.selectedRepo],
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
      <EmptyState className='empty' variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={WarningTriangleIcon} />
        <Title headingLevel='h2' size='lg'>
          Not found
        </Title>
        <EmptyStateBody>
          The file you're looking for doesn't seem to be available in this
          version of {collectionName}.
        </EmptyStateBody>
      </EmptyState>
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
