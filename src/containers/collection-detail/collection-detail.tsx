import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, CollectionDetailCard } from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';

// renders collection level information
class CollectionDetail extends React.Component<
    RouteComponentProps,
    IBaseCollectionState
> {
    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search);

        this.state = {
            collection: undefined,
            params: params,
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
                        <CollectionDetailCard
                            {...collection}
                            updateParams={p => this.updateParams(p)}
                            params={this.state.params}
                        />
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    get loadCollection() {
        return loadCollection;
    }

    get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}

export default withRouter(CollectionDetail);
