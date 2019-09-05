import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, CollectionDetailCard } from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
// import { withCollectionCommon } from './base';

// renders collection level information
class CollectionDetail extends React.Component<
    RouteComponentProps,
    IBaseCollectionState
> {
    constructor(props) {
        super(props);
        this.state = {
            collection: undefined,
            params: {},
        };
    }

    componentDidMount() {
        this.loadCollection();
    }

    render() {
        const { collection } = this.state;
        if (!collection) {
            return null;
        }

        // TODO: waiting for  #16 to merge to make collection header
        return (
            <React.Fragment>
                <BaseHeader title='Collection Detail' />
                <Main>
                    <Section className='body'>
                        <CollectionDetailCard {...collection} />
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    get loadCollection() {
        return loadCollection;
    }
}

export default withRouter(CollectionDetail);
