import * as React from 'react';
import './namespace-list.scss';

import { RouteComponentProps, Link } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    EmptyState,
    EmptyStateIcon,
    Title,
    EmptyStateBody,
    EmptyStateVariant,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';
import {
    BaseHeader,
    NamespaceCard,
    Toolbar,
    Pagination,
    LoadingPageWithHeader,
} from '../../components';
import { NamespaceAPI, NamespaceListType } from '../../api';
import { Paths, formatPath } from '../../paths';

interface IState {
    namespaces: NamespaceListType[];
    itemCount: number;
    params: {
        name?: string;
        sort?: string;
        page?: number;
        page_size?: number;
        tenant?: string;
    };
    hasPermission: boolean;
}

interface IProps extends RouteComponentProps {
    title: string;
    namespacePath: Paths;
    filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
    nonURLParams = ['tenant'];

    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        if (!params['page_size']) {
            params['page_size'] = 50;
        }

        this.state = {
            namespaces: undefined,
            itemCount: 0,
            params: params,
            hasPermission: true,
        };
    }

    componentDidMount() {
        if (this.props.filterOwner) {
            // Make a query with no params and see if it returns results to tell
            // if the user can edit namespaces
            NamespaceAPI.getMyNamespaces({}).then(results => {
                if (results.data.meta.count !== 0) {
                    this.loadNamespaces();
                } else {
                    this.setState({ hasPermission: false, namespaces: [] });
                }
            });
        } else {
            this.loadNamespaces();
        }
    }

    render() {
        const { namespaces, params, itemCount, hasPermission } = this.state;
        const { title, namespacePath } = this.props;
        if (!namespaces) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
        }

        return (
            <React.Fragment>
                <BaseHeader title={title}>
                    <div className='toolbar'>
                        <Toolbar
                            params={params}
                            sortOptions={[{ title: 'Name', id: 'name' }]}
                            searchPlaceholder={'Search ' + title}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.loadNamespaces(),
                                )
                            }
                        />

                        <div>
                            <Pagination
                                params={params}
                                updateParams={p => this.updateParams(p)}
                                count={itemCount}
                                isTop
                            />
                        </div>
                    </div>
                </BaseHeader>
                <Main>
                    {namespaces.length === 0 ? (
                        <Section>
                            <EmptyState
                                className='empty'
                                variant={EmptyStateVariant.full}
                            >
                                <EmptyStateIcon icon={WarningTriangleIcon} />
                                <Title headingLevel='h2' size='lg'>
                                    {hasPermission
                                        ? 'No matches'
                                        : 'No managed namespaces'}
                                </Title>
                                <EmptyStateBody>
                                    {hasPermission
                                        ? 'Please try adjusting your search query.'
                                        : 'This account is not set up to manage any namespaces.'}
                                </EmptyStateBody>
                            </EmptyState>
                        </Section>
                    ) : (
                        <Section className='card-layout'>
                            {namespaces.map((ns, i) => (
                                <div key={i} className='card-wrapper'>
                                    <Link
                                        to={formatPath(namespacePath, {
                                            namespace: ns.name,
                                        })}
                                    >
                                        <NamespaceCard
                                            key={i}
                                            {...ns}
                                        ></NamespaceCard>
                                    </Link>
                                </div>
                            ))}
                        </Section>
                    )}
                </Main>
            </React.Fragment>
        );
    }

    private loadNamespaces() {
        let apiFunc: any;

        if (this.props.filterOwner) {
            apiFunc = p => NamespaceAPI.getMyNamespaces(p);
        } else {
            apiFunc = p => NamespaceAPI.list(p);
        }

        apiFunc(this.state.params).then(results => {
            this.setState({
                namespaces: results.data.data,
                itemCount: results.data.meta.count,
            });
        });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin(this.nonURLParams);
    }
}
