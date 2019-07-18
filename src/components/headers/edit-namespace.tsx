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

import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface IProps {
    namespace: Namespace;
}

export class EditNamespaceHeader extends React.Component<IProps, {}> {
    render() {
        const { namespace } = this.props;
        return (
            <BaseHeader
                title={namespace.company}
                imageURL={namespace.avatar_url}
                breadcrumbs={
                    <Breadcrumb>
                        <BreadcrumbItem to='#'>My Namespaces</BreadcrumbItem>
                        <BreadcrumbItem to='#'>{namespace.name}</BreadcrumbItem>
                        <BreadcrumbItem isActive>Edit</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Grid gutter='sm'>
                    {namespace.description ? (
                        <GridItem span={12}>{namespace.description}</GridItem>
                    ) : null}
                    <GridItem span={4}>
                        <Tabs>
                            <Tab eventKey={0} title='Edit Details'></Tab>
                            <Tab eventKey={1} title='Edit Resources'></Tab>
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
