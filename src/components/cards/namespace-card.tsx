import * as React from 'react';

import { Card } from '@patternfly/react-core';

import './cards.scss';

// Use snake case to match field types provided py python API so that the
// spread operator can be used.
interface IProps {
    avatar_url: string;
    name: string;
    company: string;
    num_collections: string | number;
}

export class NamespaceCard extends React.Component<IProps, {}> {
    render() {
        const { avatar_url, name, company, num_collections } = this.props;
        return (
            <Card className='ns-card-container'>
                <div className='image-container'>
                    <img src={avatar_url} alt={company + ' logo'} />
                </div>

                <div>
                    <div className='title'>{company}</div>
                    <div>{name}</div>
                    <div>{num_collections} Collections</div>
                </div>
            </Card>
        );
    }
}
