import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, CollectionCard, Toolbar } from '../../components';
import { CollectionAPI, CollectionListType } from '../../api';
import { ParamHelper } from '../../utilities/param-helper';

interface IState {
    collections: CollectionListType[];
    numberOfResults: number;
    params: {
        page?: number;
        page_size?: number;
        keywords?: string;
        tags?: string;
        view_type?: string;
    };
}

class Search extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        this.state = {
            collections: [],
            params: params,
            numberOfResults: 0,
        };
    }

    componentDidMount() {
        CollectionAPI.list(this.state.params).then(result => {
            this.setState({ collections: result.data.data });
        });
    }

    render() {
        const { collections, params } = this.state;
        return (
            <React.Fragment>
                <BaseHeader title='Search'>
                    <div style={{ marginBottom: '16px' }}>
                        <Toolbar
                            params={params}
                            sortOptions={[{ id: 'name', title: 'Name' }]}
                            updateParams={p => this.updateParams(p)}
                            searchPlaceholder='Search Collections'
                        />
                    </div>
                </BaseHeader>
                <Main>
                    <Section style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {collections.map(c => {
                            return (
                                <CollectionCard
                                    key={c.id}
                                    {...c}
                                ></CollectionCard>
                            );
                        })}
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}

export default withRouter(Search);
