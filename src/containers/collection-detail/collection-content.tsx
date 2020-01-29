import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
    CollectionHeader,
    CollectionContentList,
    LoadingPageWithHeader,
    Main,
} from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';
import { formatPath, Paths } from '../../paths';

// renders list of contents in a collection
class CollectionImportLog extends React.Component<
    RouteComponentProps,
    IBaseCollectionState
> {
    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search);

        this.state = {
            collection: undefined,
            params: params,
        };
    }

    componentDidMount() {
        this.loadCollection();
    }

    render() {
        const { collection, params } = this.state;

        if (!collection) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
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
            { name: 'Content' },
        ];

        return (
            <React.Fragment>
                <CollectionHeader
                    collection={collection}
                    params={params}
                    updateParams={params =>
                        this.updateParams(params, () =>
                            this.loadCollection(true),
                        )
                    }
                    breadcrumbs={breadcrumbs}
                    activeTab='contents'
                />
                <Main>
                    <Section className='body'>
                        <CollectionContentList
                            contents={collection.latest_version.contents}
                            collection={collection.name}
                            namespace={collection.namespace.name}
                            params={params}
                            updateParams={p => this.updateParams(p)}
                        ></CollectionContentList>
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

export default withRouter(CollectionImportLog);
