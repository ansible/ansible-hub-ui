import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { CollectionList as CollectionListType } from '../../api/response-types/collection';
import { Namespace } from '../../api/response-types/namespace';
import { CollectionAPI } from '../../api/collection';
import { NamespaceAPI } from '../../api/namespace';
import { CollectionList } from '../../components/collection-list/collection-list';

import { PartnerHeader } from '../../components/headers/partner-header';
import { Paths } from '../../paths';

import { Breadcrumb, BreadcrumbItem, Tab, Tabs } from '@patternfly/react-core';

import * as ReactMarkdown from 'react-markdown';

import { Link } from 'react-router-dom';

enum TabKeys {
    collections = 1,
    resources = 2,
}

interface IState {
    collections: CollectionListType[];
    namespace: Namespace;
    tab: TabKeys;
    params: any;
}

class PartnerDetail extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            collections: [],
            namespace: null,
            tab: TabKeys.collections,
            params: {},
        };
    }

    componentDidMount() {
        Promise.all([
            CollectionAPI.list(),
            NamespaceAPI.get(this.props.match.params['namespace']),
        ]).then(val => {
            this.setState({ collections: val[0].data, namespace: val[1].data });
        });
    }

    render() {
        const { collections, namespace, tab, params } = this.state;
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
                            activeKey={tab}
                            onSelect={(_, key) =>
                                this.setState({ tab: parseInt(key.toString()) })
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
                        {tab === TabKeys.collections ? (
                            <CollectionList
                                updateParams={params =>
                                    this.setState({ params: params })
                                }
                                params={params}
                                collections={collections}
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

    private renderResources(namespace) {
        return (
            <div className='pf-c-content preview'>
                <ReactMarkdown source={namespace.resources_page_src} />
            </div>
        );
    }
}

export default withRouter(PartnerDetail);
