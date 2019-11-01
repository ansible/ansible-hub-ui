import * as React from 'react';
import './certification-dashboard.scss';

import * as moment from 'moment';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { BaseHeader } from '../../components';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    Toolbar,
    ToolbarGroup,
    ToolbarItem,
    Button,
    DropdownItem,
    EmptyState,
    EmptyStateIcon,
    Title,
    EmptyStateBody,
    EmptyStateVariant,
} from '@patternfly/react-core';

import {
    InfoCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    WarningTriangleIcon,
} from '@patternfly/react-icons';

import {
    CollectionVersionAPI,
    CollectionVersion,
    CertificationStatus,
} from '../../api';
import { ParamHelper } from '../../utilities';
import {
    LoadingPageWithHeader,
    StatefulDropdown,
    CompoundFilter,
    LoadingPageSpinner,
    AppliedFilters,
    Pagination,
    Sort,
} from '../../components';
import { Paths, formatPath } from '../../paths';

interface IState {
    params: {
        certification?: string;
        namespace?: string;
        collection?: string;
        page?: number;
        page_size?: number;
    };
    versions: CollectionVersion[];
    itemCount: number;
    loading: boolean;
    updatingVersions: string[];
}

class CertificationDashboard extends React.Component<
    RouteComponentProps,
    IState
> {
    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        if (!params['page_size']) {
            params['page_size'] = 10;
        }

        if (!params['sort']) {
            params['sort'] = '-pulp_created';
        }

        if (!params['certification']) {
            params['certification'] = CertificationStatus.needsReview;
        }

        this.state = {
            versions: undefined,
            itemCount: 0,
            params: params,
            loading: true,
            updatingVersions: [],
        };
    }

    componentDidMount() {
        this.queryCollections();
    }

    render() {
        const { versions, params, itemCount, loading } = this.state;

        const sortOptions = [
            {
                id: 'pulp_created',
                title: 'Date created',
            },
            { id: 'namespace', title: 'Namespace name' },
            { id: 'version', title: 'Version number' },
            { id: 'name', title: 'Collection name' },
        ];

        if (!versions) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
        }
        return (
            <React.Fragment>
                <BaseHeader title='Certification dashboard'></BaseHeader>
                <Main>
                    <Section className='body'>
                        <div className='toolbar'>
                            <Toolbar>
                                <ToolbarGroup>
                                    <ToolbarItem>
                                        <CompoundFilter
                                            updateParams={p =>
                                                this.updateParams(p, () =>
                                                    this.queryCollections(),
                                                )
                                            }
                                            params={params}
                                            filterConfig={[
                                                {
                                                    id: 'namespace',
                                                    title: 'Namespace',
                                                },
                                                {
                                                    id: 'name',
                                                    title: 'Collection Name',
                                                },
                                                {
                                                    id: 'certification',
                                                    title:
                                                        'Certification Status',
                                                    inputType: 'select',
                                                    options: [
                                                        {
                                                            id: 'not_certified',
                                                            title: 'Rejected',
                                                        },
                                                        {
                                                            id: 'needs_review',
                                                            title:
                                                                'Needs Review',
                                                        },
                                                        {
                                                            id: 'certified',
                                                            title: 'Certified',
                                                        },
                                                    ],
                                                },
                                            ]}
                                        />
                                    </ToolbarItem>
                                </ToolbarGroup>
                                <ToolbarGroup>
                                    <ToolbarItem>
                                        <Sort
                                            options={sortOptions}
                                            params={params}
                                            updateParams={p =>
                                                this.updateParams(p, () =>
                                                    this.queryCollections(),
                                                )
                                            }
                                        />
                                    </ToolbarItem>
                                </ToolbarGroup>
                            </Toolbar>

                            <Pagination
                                params={params}
                                updateParams={p =>
                                    this.updateParams(p, () =>
                                        this.queryCollections(),
                                    )
                                }
                                count={itemCount}
                                isTop
                            />
                        </div>
                        <div>
                            <AppliedFilters
                                updateParams={p =>
                                    this.updateParams(p, () =>
                                        this.queryCollections(),
                                    )
                                }
                                params={params}
                                ignoredParams={['page_size', 'page', 'sort']}
                            />
                        </div>
                        {loading ? (
                            <LoadingPageSpinner />
                        ) : (
                            this.renderTable(versions)
                        )}

                        <div className='footer'>
                            <Pagination
                                params={params}
                                updateParams={p =>
                                    this.updateParams(p, () =>
                                        this.queryCollections(),
                                    )
                                }
                                count={itemCount}
                            />
                        </div>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private renderTable(versions) {
        if (versions.length === 0) {
            return (
                <EmptyState className='empty' variant={EmptyStateVariant.full}>
                    <EmptyStateIcon icon={WarningTriangleIcon} />
                    <Title headingLevel='h2' size='lg'>
                        No matches
                    </Title>
                    <EmptyStateBody>
                        Please try adjusting your search query.
                    </EmptyStateBody>
                </EmptyState>
            );
        }

        return (
            <table
                aria-label='Collection versions'
                className='content-table pf-c-table'
            >
                <thead>
                    <tr aria-labelledby='headers'>
                        <th>Namespace</th>
                        <th>Collection</th>
                        <th>Version</th>
                        <th>Date created</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {versions.map((version, i) => this.renderRow(version, i))}
                </tbody>
            </table>
        );
    }

    private renderStatus(version: CollectionVersion) {
        if (this.state.updatingVersions.includes(version.id)) {
            return <span className='fa status-icon fa-spin fa-spinner' />;
        }
        switch (version.certification) {
            case CertificationStatus.certified:
                return (
                    <span>
                        <CheckCircleIcon className='certified-icon' /> Certified
                    </span>
                );
            case CertificationStatus.notCertified:
                return (
                    <span>
                        <ExclamationCircleIcon className='rejected-icon' />{' '}
                        Rejected
                    </span>
                );
            case CertificationStatus.needsReview:
                return (
                    <span>
                        <InfoCircleIcon className='needs-review-icon' /> Needs
                        Review
                    </span>
                );
        }
    }

    private renderRow(version: CollectionVersion, index) {
        return (
            <tr
                aria-labelledby={`${version.namespace}.${version.name} v${version.version}`}
                key={index}
            >
                <td>{version.namespace}</td>
                <td>{version.name}</td>
                <td>
                    <Link
                        to={formatPath(
                            Paths.collection,
                            {
                                namespace: version.namespace,
                                collection: version.name,
                            },
                            {
                                version: version.version,
                            },
                        )}
                    >
                        {version.version}
                    </Link>
                </td>
                <td>{moment(version.created_at).fromNow()}</td>
                <td>{this.renderStatus(version)}</td>
                <td>
                    <div className='control-column'>
                        <div>{this.renderButtons(version)}</div>
                    </div>
                </td>
            </tr>
        );
    }

    private renderButtons(version: CollectionVersion) {
        const importsLink = (
            <DropdownItem key='imports' component='span'>
                <Link
                    to={formatPath(
                        Paths.myImports,
                        {},
                        {
                            namespace: version.namespace,
                            name: version.name,
                            version: version.version,
                        },
                    )}
                >
                    View Import Logs
                </Link>
            </DropdownItem>
        );

        const certifyDropDown = (isDisabled: boolean) => (
            <DropdownItem
                onClick={() =>
                    this.updateCertification(
                        version,
                        CertificationStatus.certified,
                    )
                }
                isDisabled={isDisabled}
                key='certify'
            >
                Certify
            </DropdownItem>
        );

        const rejectDropDown = (isDisabled: boolean) => (
            <DropdownItem
                onClick={() =>
                    this.updateCertification(
                        version,
                        CertificationStatus.notCertified,
                    )
                }
                isDisabled={isDisabled}
                className='rejected-icon'
                key='reject'
            >
                Reject
            </DropdownItem>
        );

        switch (version.certification) {
            case CertificationStatus.certified:
                return (
                    <span>
                        <StatefulDropdown
                            items={[
                                certifyDropDown(true),
                                rejectDropDown(false),
                                importsLink,
                            ]}
                        />
                    </span>
                );
            case CertificationStatus.notCertified:
                return (
                    <span>
                        <StatefulDropdown
                            items={[
                                certifyDropDown(false),
                                rejectDropDown(true),
                                importsLink,
                            ]}
                        />
                    </span>
                );
            case CertificationStatus.needsReview:
                return (
                    <span>
                        <Button
                            onClick={() =>
                                this.updateCertification(
                                    version,
                                    CertificationStatus.certified,
                                )
                            }
                        >
                            <span>Certify</span>
                        </Button>
                        <StatefulDropdown
                            items={[rejectDropDown(false), importsLink]}
                        />
                    </span>
                );
        }
    }

    private updateCertification(version, certification) {
        // Set the selected version to loading
        this.setState(
            {
                updatingVersions: this.state.updatingVersions.concat([
                    version.id,
                ]),
            },
            () =>
                // TODO: add error checking
                // Perform the PUT request
                CollectionVersionAPI.setCertifiation(
                    version.namespace,
                    version.name,
                    version.version,
                    certification,
                ).then(() =>
                    // Since pulp doesn't reply with the new object, perform a
                    // second query to get the updated data
                    CollectionVersionAPI.list({
                        namespace: version.namespace,
                        name: version.name,
                        version: version.version,
                    }).then(result => {
                        const updatedVersion = result.data.data[0];
                        const newVersionList = [...this.state.versions];
                        const ind = newVersionList.findIndex(
                            x => x.id === updatedVersion.id,
                        );
                        newVersionList[ind] = updatedVersion;

                        this.setState({
                            versions: newVersionList,
                            updatingVersions: this.state.updatingVersions.filter(
                                v => v != updatedVersion.id,
                            ),
                        });
                    }),
                ),
        );
    }

    private queryCollections() {
        this.setState({ loading: true }, () =>
            CollectionVersionAPI.list(this.state.params).then(result =>
                this.setState({
                    versions: result.data.data,
                    itemCount: result.data.meta.count,
                    loading: false,
                    updatingVersions: [],
                }),
            ),
        );
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}

export default withRouter(CertificationDashboard);
