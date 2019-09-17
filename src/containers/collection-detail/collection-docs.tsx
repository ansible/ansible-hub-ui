import * as React from 'react';
import './collection-detail.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import {
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Title,
    EmptyStateIcon,
} from '@patternfly/react-core';

import { WarningTriangleIcon } from '@patternfly/react-icons';

import {
    CollectionHeader,
    TableOfContents,
    RenderPluginDoc,
    LoadingPageWithHeader,
} from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';
import { formatPath, Paths } from '../../paths';

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
        this.loadCollection();
    }

    render() {
        const { params, collection } = this.state;
        const urlFields = this.props.match.params;

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
                    // TODO: insights crashes when you give it a .md page. Need to find
                    // a more elegant solution to this problem
                    x => x.name.replace('.', '-') === urlFields['page'],
                );

                if (file) {
                    displayHTML = file.html;
                }
            }
        } else if (contentName) {
            // check if contents exists
            if (collection.latest_version.docs_blob.contents) {
                const content = collection.latest_version.docs_blob.contents.find(
                    x =>
                        x.content_type === contentType &&
                        x.content_name === contentName,
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
                        this.updateParams(p, () => this.loadCollection(true))
                    }
                    breadcrumbs={breadcrumbs}
                    activeTab='documentation'
                    className='header'
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
                        <div
                            className='body docs pf-c-content'
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
                                    ></div>
                                ) : (
                                    // if plugin data is set render it
                                    <RenderPluginDoc plugin={pluginData} />
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

    private renderNotFound(collectionName) {
        return (
            <EmptyState className='empty' variant={EmptyStateVariant.full}>
                <EmptyStateIcon icon={WarningTriangleIcon} />
                <Title headingLevel='h2' size='lg'>
                    Not Found
                </Title>
                <EmptyStateBody>
                    The file you're looking for doesn't seem to be available in
                    this version of {collectionName}.
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
