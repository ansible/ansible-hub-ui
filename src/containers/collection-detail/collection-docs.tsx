import * as React from 'react';
import './collection-detail.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import {
    CollectionHeader,
    TableOfContents,
    RenderPluginDoc,
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
            return null;
        }

        let displayHTML: string;
        let pluginData;

        const contentType = urlFields['type'] || 'docs';
        const contentName = urlFields['name'] || urlFields['page'] || null;

        if (contentType === 'docs' && contentName) {
            displayHTML = collection.latest_version.docs_blob.documentation_files.find(
                // TODO: insights crashes when you give it a .md page. Need to find
                // a more elegant solution to this problem
                x => x.name.replace('.', '-') === urlFields['page'],
            ).html;
        } else if (contentName) {
            const content = collection.latest_version.docs_blob.contents.find(
                x =>
                    x.content_type === contentType &&
                    x.content_name === contentName,
            );

            if (contentType === 'role') {
                displayHTML = content['readme_html'];
            } else {
                pluginData = content;
            }
        } else {
            if (collection.latest_version.docs_blob.collection_readme) {
                displayHTML =
                    collection.latest_version.docs_blob.collection_readme.html;
            } else {
                displayHTML = 'This collection is missing a README';
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
                            {displayHTML ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: displayHTML,
                                    }}
                                ></div>
                            ) : (
                                <RenderPluginDoc plugin={pluginData} />
                            )}
                        </div>
                    </Section>
                </Main>
            </React.Fragment>
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
