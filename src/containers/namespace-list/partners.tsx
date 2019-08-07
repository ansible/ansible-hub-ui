import * as React from 'react';
import './namespace-list.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Pagination } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities/param-helper';
import { BaseHeader, NamespaceCard, Toolbar } from '../../components';
import { NamespaceAPI, NamespaceListType } from '../../api';
import { Constants } from '../../constants';

interface IState {
    namespaces: NamespaceListType[];
    itemCount: number;
    params: {
        name?: string;
        sort?: string;
        page?: number;
        page_size?: number;
    };
}

class Partners extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            namespaces: undefined,
            itemCount: 0,
            params: ParamHelper.parseParamString(props.location.search),
        };
    }

    render() {
        const { namespaces, params, itemCount } = this.state;
        if (!namespaces) {
            return null;
        }

        return (
            <React.Fragment>
                <BaseHeader title='Partners'>
                    <div className='toolbar'>
                        <Toolbar
                            params={params}
                            sortOptions={[{ title: 'Name', id: 'name' }]}
                            searchPlaceholder='Search Partners'
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.loadNamespaces(),
                                )
                            }
                        />

                        <div>
                            <Pagination
                                itemCount={itemCount}
                                perPage={params.page_size || 50}
                                page={params.page || 1}
                                onSetPage={(_, p) =>
                                    this.updateParams(
                                        ParamHelper.setParam(params, 'page', p),
                                        () => this.loadNamespaces(),
                                    )
                                }
                                onPerPageSelect={(_, p) => {
                                    this.updateParams(
                                        {
                                            ...params,
                                            page: 1,
                                            page_size: p,
                                        },
                                        () => this.loadNamespaces(),
                                    );
                                }}
                            />
                        </div>
                    </div>
                </BaseHeader>
                <Main>
                    <Section className='card-layout'>
                        {namespaces.map((ns, i) => (
                            <div key={i} className='card-wrapper'>
                                <NamespaceCard key={i} {...ns}></NamespaceCard>
                            </div>
                        ))}
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    componentDidMount() {
        this.loadNamespaces();
    }

    private loadNamespaces() {
        NamespaceAPI.list(this.state.params).then(results => {
            this.setState({
                namespaces: results.data.data,
                itemCount: results.data.meta.count,
            });
        });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}

export default withRouter(Partners);
