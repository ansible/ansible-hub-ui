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

import { CollectionListType, NamespaceType } from '../../api';

import { renderResources, loadCollections, loadAll } from './shared-functions';

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

class ManageNamespace extends React.Component<RouteComponentProps, IState> {
    nonAPIParams = ['tab'];

    // These methods are all shared with the manange namespace view, so they
    // are loaded from a shared library

    get renderResources() {
        return renderResources;
    }

    get loadCollections() {
        return loadCollections;
    }

    get loadAll() {
        return loadAll;
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
                                showControls={true}
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

export default withRouter(ManageNamespace);
