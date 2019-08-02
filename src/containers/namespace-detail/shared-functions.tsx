import * as React from 'react';

import * as ReactMarkdown from 'react-markdown';

import { CollectionAPI, NamespaceAPI, NamespaceType } from '../../api';

import { ParamHelper } from '../../utilities/param-helper';
import { Paths } from '../../paths';

export function updateParams(params: object, dontLoadAPI?: boolean) {
    this.setState({ params: params }, () => {
        if (!dontLoadAPI) {
            this.loadCollections();
        }
    });
    this.props.history.push({
        pathname: this.props.location.pathname,
        search: '?' + ParamHelper.getQueryString(params),
    });
}

export function renderResources(namespace: NamespaceType) {
    return (
        <div className='pf-c-content preview'>
            <ReactMarkdown source={namespace.resources_page_src} />
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

export function loadAll() {
    Promise.all([
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, this.nonAPIParams),
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
