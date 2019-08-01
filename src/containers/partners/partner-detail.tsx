import * as React from 'react';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Breadcrumb, BreadcrumbItem, Tab, Tabs } from '@patternfly/react-core';
import * as ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import {
    CollectionListType,
    NamespaceType,
    CollectionAPI,
    NamespaceAPI,
} from '../../api';

import { CollectionList, PartnerHeader } from '../../components';
import { ParamHelper } from '../../utilities/param-helper';
import { Paths } from '../../paths';

enum TabKeys {
    collections = 1,
    resources = 2,
}

interface IState {
    collections: CollectionListType[];
    namespace: NamespaceType;
    params: {
        sort?: string;
        page?: number;
        page_size?: number;
        tab?: number;
        keywords?: string;
    };
    redirect: string;
    itemCount: number;
}

class PartnerDetail extends React.Component<RouteComponentProps, IState> {
    nonAPIParams = ['tab'];

    constructor(props) {
        super(props);
        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'tab',
            'page_size',
        ]);

        if (!params['tab']) {
            params['tab'] = 1;
        }

        this.state = {
            collections: [],
            namespace: null,
            params: params,
            redirect: null,
            itemCount: 0,
        };
    }

    componentDidMount() {
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
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={Paths.partners}>Partners</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem isActive>
                                {namespace.name}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                    tabs={
                        <Tabs
                            activeKey={params.tab}
                            onSelect={(_, key) =>
                                this.updateParams(
                                    ParamHelper.setParam(
                                        params,
                                        'tab',
                                        parseInt(key.toString()),
                                    ),
                                    true,
                                )
                            }
                        >
                            <Tab
                                eventKey={TabKeys.collections}
                                title='Collections'
                            ></Tab>
                            <Tab
                                eventKey={TabKeys.resources}
                                title='Resources'
                            ></Tab>
                        </Tabs>
                    }
                ></PartnerHeader>
                <Main>
                    <Section className='body'>
                        {params.tab === TabKeys.collections ? (
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

    private renderCollections(collections) {}

    private updateParams(params, dontLoadAPI?) {
        this.setState({ params: params }, () => {
            if (!dontLoadAPI) {
                this.reloadCollections();
            }
        });
        this.props.history.push({
            pathname: this.props.location.pathname,
            search: '?' + ParamHelper.getQueryString(params),
        });
    }

    private renderResources(namespace) {
        return (
            <div className='pf-c-content preview'>
                <ReactMarkdown source={namespace.resources_page_src} />
            </div>
        );
    }

    private reloadCollections() {
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, this.nonAPIParams),
        ).then(result => {
            this.setState({
                collections: result.data.data,
                itemCount: result.data.meta.count,
            });
        });
    }
}

export default withRouter(PartnerDetail);
