import * as React from 'react';

import { Card } from '@patternfly/react-core';

import './cards.scss';

interface IProps {
    avatarURL: string;
    name: string;
    company: string;
    numCollections: string | number;
}

export class NamespaceCard extends React.Component<IProps, {}> {
    render() {
        const { avatarURL, name, company, numCollections } = this.props;
        return (
            <Card className='ns-card-container'>
                <div className='image-container'>
                    <img src={avatarURL} alt={company + ' logo'} />
                </div>

                <div>
                    <div className='title'>{company}</div>
                    <div>{name}</div>
                    <div>{numCollections} Collections</div>
                </div>
            </Card>
        );
    }
}
