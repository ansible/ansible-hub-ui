import * as React from 'react';

import * as ReactMarkdown from 'react-markdown';

import { CollectionAPI, NamespaceAPI, NamespaceType } from '../../api';

import { ParamHelper } from '../../utilities/param-helper';
import { Paths } from '../../paths';

export function renderResources(namespace: NamespaceType) {
    return (
        <div className='pf-c-content preview'>
            <ReactMarkdown source={namespace.resources_page} />
        </div>
    );
}

export function loadCollections() {
    CollectionAPI.list(
        ParamHelper.getReduced(this.state.params, this.nonAPIParams),
    ).then(result => {
        this.setState({
            collections: result.data.data,
            itemCount: result.data.meta.count,
        });
    });
}

// todo: DON'T MERGE THIS WITHOUT SWITCHING BACK TO THE ACTUAL API
export function loadAll() {
    Promise.all([
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, this.nonAPIParams),
            'api/internal/ui/collections/'
        ),
        NamespaceAPI.get(this.props.match.params['namespace']),
    ])
        .then(val => {
            this.setState({
                // collections: val[0].data.data,
                // itemCount: val[0].data.meta.count,
                collections: val[0].data.results,
                itemCount: val[0].data.count,
                namespace: val[1].data,
            });
        })
        .catch(response => {
            this.setState({ redirect: Paths.notFound });
        });
}
