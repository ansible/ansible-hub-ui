import * as React from 'react';
import './cards.scss';

import { Card } from '@patternfly/react-core';

import { NumericLabel, Logo } from '../../components';
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
                <Logo
                    className='logo'
                    image={avatar_url}
                    alt={company + ' logo'}
                    size='100px'
                />

                <div>
                    <div className='title'>{company}</div>
                    <div>{name}</div>
                    {
                        // TODO: current API doesn't provide collection count for namespaces
                        // <div>
                        //     <NumericLabel
                        //         number={num_collections}
                        //         label='Collection'
                        //     />
                        // </div>
                    }
                </div>
            </Card>
        );
    }
}
