import * as React from 'react';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { CollectionListType, NamespaceType } from '../../api';

import {
    updateParams,
    renderResources,
    loadCollections,
    loadAll,
} from './shared-functions';

import {
    CollectionList,
    PartnerHeader,
    Breadcrumbs,
    Tabs,
} from '../../components';
import { ParamHelper } from '../../utilities/param-helper';
import { Paths } from '../../paths';

interface IState {
    collections: CollectionListType[];
    namespace: NamespaceType;
    params: {
        sort?: string;
        page?: number;
        page_size?: number;
        tab?: string;
        keywords?: string;
    };
    redirect: string;
    itemCount: number;
}

class PartnerDetail extends React.Component<RouteComponentProps, IState> {
    nonAPIParams = ['tab'];

    // These methods are all shared with the manange namespace view, so they
    // are loaded from a shared library
    get updateParams() {
        return updateParams;
    }

    get renderResources() {
        return renderResources;
    }

    get loadCollections() {
        return loadCollections;
    }

    get loadAll() {
        return loadAll;
    }

    constructor(props) {
        super(props);
        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        this.state = {
            collections: [],
            namespace: null,
            params: params,
            redirect: null,
            itemCount: 0,
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
        } = this.state;

        if (redirect) {
            return <Redirect to={redirect} />;
        }

        if (!namespace) {
            return null;
        }
        return (
            <React.Fragment>
                <PartnerHeader
                    namespace={namespace}
                    breadcrumbs={
                        <Breadcrumbs
                            links={[
                                { url: Paths.partners, name: 'Partners' },
                                { name: namespace.name },
                            ]}
                        />
                    }
                    tabs={
                        <Tabs
                            tabs={['Collections', 'Resources']}
                            params={params}
                            updateParams={p => this.updateParams(p, true)}
                        />
                    }
                ></PartnerHeader>
                <Main>
                    <Section className='body'>
                        {params.tab.toLowerCase() === 'collections' ? (
                            <CollectionList
                                updateParams={params =>
                                    this.updateParams(params)
                                }
                                params={params}
                                collections={collections}
                                itemCount={itemCount}
                            />
                        ) : (
                            this.renderResources(namespace)
                        )}
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(PartnerDetail);
