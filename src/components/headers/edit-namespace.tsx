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
                <Grid>
                    <GridItem span={12}>{namespace.description}</GridItem>
                    <GridItem span={4}>
                        <Tabs>
                            <Tab eventKey={0} title='Edit Details'></Tab>
                            <Tab eventKey={1} title='Edit Resources'></Tab>
                        </Tabs>
                    </GridItem>
                    {namespace.useful_links.length > 0 ? (
                        <GridItem className='links' span={8}>
                            <div>
                                <i className='fas fa-external-link-square-alt'></i>
                            </div>
                            {namespace.useful_links.map(x => {
                                return (
                                    <div>
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
