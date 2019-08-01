import * as React from 'react';
import './header.scss';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { BaseHeader } from '../../components';
import { NamespaceType } from '../../api';

interface IProps {
    namespace: NamespaceType;
    tabs: React.ReactNode;
    breadcrumbs: React.ReactNode;
}

export class PartnerHeader extends React.Component<IProps, {}> {
    render() {
        const { namespace, breadcrumbs, tabs } = this.props;
        return (
            <BaseHeader
                title={namespace.company}
                imageURL={namespace.avatar_url}
                breadcrumbs={breadcrumbs}
            >
                {namespace.description ? (
                    <div>{namespace.description}</div>
                ) : null}

                <div className='tab-link-container'>
                    <div className='tabs'>{tabs}</div>
                    {namespace.useful_links.length > 0 ? (
                        <div className='links'>
                            <div>
                                <ExternalLinkAltIcon />
                            </div>
                            {namespace.useful_links.map((x, i) => {
                                return (
                                    <div className='link' key={i}>
                                        <a href={x.url} target='blank'>
                                            {x.name}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </BaseHeader>
        );
    }
}
