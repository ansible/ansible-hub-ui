import * as React from 'react';
import { BaseHeader } from './base-header';
import { Namespace } from '../../api/response-types/namespace';
import './header.scss';

import {
    Breadcrumb,
    BreadcrumbItem,
    Tab,
    Tabs,
    Grid,
    GridItem,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { Paths, formatPath } from '../../paths';

interface IProps {
    namespace: Namespace;
    activeTab: TabKeys;

    tabClick: (key) => void;
}

export enum TabKeys {
    details = 1,
    resources = 2,
}

export class EditNamespaceHeader extends React.Component<IProps, {}> {
    render() {
        const { namespace, activeTab } = this.props;
        // TODO: Fix links on breadcrumbs to use react router.
        return (
            <BaseHeader
                title={namespace.company}
                imageURL={namespace.avatar_url}
                breadcrumbs={
                    <Breadcrumb>
                        <BreadcrumbItem to={Paths.myNamespaces}>
                            My Namespaces
                        </BreadcrumbItem>
                        <BreadcrumbItem
                            to={formatPath(Paths.myCollections, {
                                namespace: namespace.name,
                            })}
                        >
                            {namespace.name}
                        </BreadcrumbItem>
                        <BreadcrumbItem isActive>Edit</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Grid gutter='sm'>
                    {namespace.description ? (
                        <GridItem span={12}>{namespace.description}</GridItem>
                    ) : null}
                    <GridItem span={4}>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(_, index) => this.props.tabClick(index)}
                        >
                            <Tab
                                eventKey={TabKeys.details}
                                title='Edit Details'
                            ></Tab>
                            <Tab
                                eventKey={TabKeys.resources}
                                title='Edit Resources'
                            ></Tab>
                        </Tabs>
                    </GridItem>
                    {namespace.useful_links.length > 0 ? (
                        <GridItem className='links' span={8}>
                            <div>
                                <ExternalLinkAltIcon />
                            </div>
                            {namespace.useful_links.map((x, i) => {
                                return (
                                    <div key={i}>
                                        <a href={x.url} target='blank'>
                                            {x.name}
                                        </a>
                                    </div>
                                );
                            })}
                        </GridItem>
                    ) : null}
                </Grid>
            </BaseHeader>
        );
    }
}
