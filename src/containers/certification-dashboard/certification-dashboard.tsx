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
    TextInput,
    InputGroup,
    Button,
    ButtonVariant,
    DropdownItem,
} from '@patternfly/react-core';

import {
    InfoCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
} from '@patternfly/react-icons';

import {
    CollectionVersionAPI,
    CollectionVersion,
    CertificationStatus,
} from '../../api';
import { ParamHelper } from '../../utilities';
import { LoadingPageWithHeader, StatefulDropdown } from '../../components';
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

        this.state = {
            versions: undefined,
            itemCount: 0,
            params: params,
        };
    }

    componentDidMount() {
        CollectionVersionAPI.list(this.state.params).then(result =>
            this.setState({
                versions: result.data.data,
                itemCount: result.data.meta.count,
            }),
        );
    }

    render() {
        const { versions, params, itemCount } = this.state;

        if (!versions) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
        }
        return (
            <React.Fragment>
                <BaseHeader title='Certification dashboard'>
                    <div className='toolbar'>
                        <Toolbar>
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <TextInput></TextInput>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </Toolbar>
                    </div>
                </BaseHeader>
                <Main>
                    <Section className='body'>
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
                                {versions.map((version, i) =>
                                    this.renderRow(version, i),
                                )}
                            </tbody>
                        </table>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private renderStatus(status: CertificationStatus) {
        switch (status) {
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
                <td>{this.renderStatus(version.certification)}</td>
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
            <DropdownItem key={2} component='span'>
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

        switch (version.certification) {
            case CertificationStatus.certified:
                return (
                    <span>
                        <StatefulDropdown
                            items={[
                                <DropdownItem isDisabled key={1}>
                                    Certify
                                </DropdownItem>,
                                <DropdownItem className='rejected-icon' key={1}>
                                    Reject
                                </DropdownItem>,
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
                                <DropdownItem key={1}>Certify</DropdownItem>,
                                <DropdownItem isDisabled key={1}>
                                    Reject
                                </DropdownItem>,
                                importsLink,
                            ]}
                        />
                    </span>
                );
            case CertificationStatus.needsReview:
                return (
                    <span>
                        <Button>
                            <span>Certify</span>
                        </Button>
                        <StatefulDropdown
                            items={[
                                <DropdownItem className='rejected-icon' key={1}>
                                    Reject
                                </DropdownItem>,
                                importsLink,
                            ]}
                        />
                    </span>
                );
        }
    }
}

export default withRouter(CertificationDashboard);
