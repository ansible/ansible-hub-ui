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
    ImportModal,
} from '../../components';
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
    };
    redirect: string;
    itemCount: number;
    showImportModal: boolean;
    warning: string;
}

interface IProps extends RouteComponentProps {
    showControls: boolean;
}

export class NamespaceDetail extends React.Component<IProps, IState> {
    nonAPIParams = ['tab'];

    renderResources(namespace: NamespaceType) {
        return (
            <div className='pf-c-content preview'>
                <ReactMarkdown source={namespace.resources_page} />
            </div>
        );
    }

    loadCollections() {
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, this.nonAPIParams),
        ).then(result => {
            this.setState({
                collections: result.data.data,
                itemCount: result.data.meta.count,
            });
        });
    }

    // todo: DON'T MERGE THIS WITHOUT SWITCHING BACK TO THE ACTUAL API
    loadAll() {
        Promise.all([
            CollectionAPI.list(
                ParamHelper.getReduced(this.state.params, this.nonAPIParams),
                'api/internal/ui/collections/',
            ),
            NamespaceAPI.get(this.props.match.params['namespace']),
        ])
            .then(val => {
                this.setState({
                    // collections: val[0].data.data,
                    // itemCount: val[0].data.meta.count,
                    collections: val[0].data.results,
                    itemCount: val[0].data.count,
                    namespace: val[1].data,
                });
            })
            .catch(response => {
                this.setState({ redirect: Paths.notFound });
            });
    }

    get updateParams() {
        return ParamHelper.updateParamsMixin();
    }

    constructor(props) {
        super(props);
        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        if (!params['tab']) {
            params['tab'] = 'collections';
        }

        this.state = {
            collections: [],
            namespace: null,
            params: params,
            redirect: null,
            itemCount: 0,
            showImportModal: false,
            warning: '',
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
        } = this.state;

        if (redirect) {
            return <Redirect to={redirect} />;
        }

        if (!namespace) {
            return null;
        }
        return (
            <React.Fragment>
                <ImportModal
                    isOpen={showImportModal}
                    onUploadSuccess={x => console.log(x)}
                    // onCancel
                    setOpen={(isOpen, warn) =>
                        this.toggleImportModal(isOpen, warn)
                    }
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
                    breadcrumbs={[
                        { url: Paths.myNamespaces, name: 'My Namespaces' },
                        { name: namespace.name },
                    ]}
                    tabs={['Collections', 'Resources']}
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
                                handleControlClick={(id, v) =>
                                    console.log(id, v)
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

    private renderPageControls() {
        if (!this.props.showControls) {
            return null;
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    onClick={() => this.setState({ showImportModal: true })}
                >
                    Upload Collection
                </Button>
                <StatefulDropdown
                    items={[
                        <DropdownItem key='1'>
                            <Link
                                to={formatPath(Paths.editNamespace, {
                                    namespace: this.state.namespace.name,
                                })}
                            >
                                Edit Namespace
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

        this.setState(newState);
    }
}
