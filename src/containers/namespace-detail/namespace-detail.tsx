import * as React from 'react';

import {
    withRouter,
    RouteComponentProps,
    Redirect,
    Link,
} from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    Button,
    DropdownItem,
    Alert,
    AlertActionCloseButton,
} from '@patternfly/react-core';

import * as ReactMarkdown from 'react-markdown';

import {
    CollectionListType,
    CollectionAPI,
    NamespaceAPI,
    NamespaceType,
} from '../../api';

import {
    CollectionList,
    PartnerHeader,
    StatefulDropdown,
    LoadingPageWithHeader,
} from '../../components';

import { ImportModal } from './import-modal/import-modal';

import { ParamHelper } from '../../utilities/param-helper';
import { Paths, formatPath } from '../../paths';

interface IState {
    collections: CollectionListType[];
    namespace: NamespaceType;
    params: {
        sort?: string;
        page?: number;
        page_size?: number;
        tab?: string;
        keywords?: string;
        namespace?: string;
    };
    redirect: string;
    itemCount: number;
    showImportModal: boolean;
    warning: string;
    updateCollection: CollectionListType;
}

interface IProps extends RouteComponentProps {
    showControls: boolean;
    breadcrumbs: { name: string; url?: string }[];
}

export class NamespaceDetail extends React.Component<IProps, IState> {
    nonAPIParams = ['tab'];

    // namespace is a positional url argument, so don't include it in the
    // query params
    nonQueryStringParams = ['namespace'];

    constructor(props) {
        super(props);
        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        if (!params['tab']) {
            params['tab'] = 'collections';
        }

        params['namespace'] = props.match.params['namespace'];

        this.state = {
            collections: [],
            namespace: null,
            params: params,
            redirect: null,
            itemCount: 0,
            showImportModal: false,
            warning: '',
            updateCollection: null,
        };
    }

    componentDidMount() {
        this.loadAll();
    }

    render() {
        const {
            collections,
            namespace,
            params,
            redirect,
            itemCount,
            showImportModal,
            warning,
            updateCollection,
        } = this.state;

        const { breadcrumbs } = this.props;

        if (redirect) {
            return <Redirect to={redirect} />;
        }

        if (!namespace) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
        }

        const tabs = ['Collections'];

        if (namespace.resources) {
            tabs.push('Resources');
        }

        return (
            <React.Fragment>
                <ImportModal
                    isOpen={showImportModal}
                    onUploadSuccess={result =>
                        this.props.history.push(
                            formatPath(
                                Paths.myImports,
                                {},
                                {
                                    namespace: namespace.name,
                                },
                            ),
                        )
                    }
                    // onCancel
                    setOpen={(isOpen, warn) =>
                        this.toggleImportModal(isOpen, warn)
                    }
                    collection={updateCollection}
                />
                {warning ? (
                    <Alert
                        style={{
                            position: 'fixed',
                            right: '5px',
                            top: '80px',
                            zIndex: 300,
                        }}
                        variant='warning'
                        title={warning}
                        action={
                            <AlertActionCloseButton
                                onClose={() => this.setState({ warning: '' })}
                            />
                        }
                    ></Alert>
                ) : null}
                <PartnerHeader
                    namespace={namespace}
                    breadcrumbs={breadcrumbs.concat([{ name: namespace.name }])}
                    tabs={tabs}
                    params={params}
                    updateParams={p => this.updateParams(p)}
                    pageControls={this.renderPageControls()}
                ></PartnerHeader>
                <Main>
                    <Section className='body'>
                        {params.tab.toLowerCase() === 'collections' ? (
                            <CollectionList
                                updateParams={params =>
                                    this.updateParams(params, () =>
                                        this.loadCollections(),
                                    )
                                }
                                params={params}
                                collections={collections}
                                itemCount={itemCount}
                                showControls={this.props.showControls}
                                handleControlClick={(id, action) =>
                                    this.handleCollectionAction(id, action)
                                }
                            />
                        ) : (
                            this.renderResources(namespace)
                        )}
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private handleCollectionAction(id, action) {
        if (action === 'upload') {
            const collection = this.state.collections.find(x => x.id === id);

            this.setState({
                updateCollection: collection,
                showImportModal: true,
            });
        }
    }

    private renderResources(namespace: NamespaceType) {
        return (
            <div className='pf-c-content preview'>
                <ReactMarkdown source={namespace.resources} />
            </div>
        );
    }

    private loadCollections() {
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, this.nonAPIParams),
        ).then(result => {
            this.setState({
                collections: result.data.data,
                itemCount: result.data.meta.count,
            });
        });
    }

    private loadAll() {
        Promise.all([
            CollectionAPI.list(
                ParamHelper.getReduced(this.state.params, this.nonAPIParams),
            ),
            NamespaceAPI.get(this.props.match.params['namespace']),
        ])
            .then(val => {
                this.setState({
                    collections: val[0].data.data,
                    itemCount: val[0].data.meta.count,
                    namespace: val[1].data,
                });
            })
            .catch(response => {
                this.setState({ redirect: Paths.notFound });
            });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
    }

    private renderPageControls() {
        if (!this.props.showControls) {
            return null;
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    onClick={() => this.setState({ showImportModal: true })}
                >
                    Upload collection
                </Button>
                <StatefulDropdown
                    items={[
                        <DropdownItem key='1'>
                            <Link
                                to={formatPath(Paths.editNamespace, {
                                    namespace: this.state.namespace.name,
                                })}
                            >
                                Edit namespace
                            </Link>
                        </DropdownItem>,
                        <DropdownItem key='2'>
                            <Link
                                to={formatPath(
                                    Paths.myImports,
                                    {},
                                    { namespace: this.state.namespace.name },
                                )}
                            >
                                Imports
                            </Link>
                        </DropdownItem>,
                        <DropdownItem key='3'>
                            <Link to={Paths.token} target='_blank'>
                                Get API token
                            </Link>
                        </DropdownItem>,
                    ]}
                />
            </div>
        );
    }

    private toggleImportModal(isOpen: boolean, warning?: string) {
        const newState = { showImportModal: isOpen };
        if (warning) {
            newState['warning'] = warning;
        }

        if (!isOpen) {
            newState['updateCollection'] = null;
        }

        this.setState(newState);
    }
}
