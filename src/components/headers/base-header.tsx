import * as React from 'react';
import './header.scss';

import {
    PageHeader,
    PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';

import { Breadcrumb } from '@patternfly/react-core';

interface IProps {
    title: string;
    imageURL?: string;
    breadcrumbs?: React.ReactNode;
    pageControls?: React.ReactNode;
    children?: React.ReactNode;
}

export class BaseHeader extends React.Component<IProps, {}> {
    render() {
        const {
            title,
            imageURL,
            pageControls,
            children,
            breadcrumbs,
        } = this.props;
        return (
            <div className="background">
                {breadcrumbs ? (
                    <div className="breadcrumb-container">{breadcrumbs}</div>
                ) : (
                    <div className="placeholder" />
                )}
                <div className="column-section">
                    <div className="title-box">
                        {imageURL ? (
                            <div className="image-container">
                                <img
                                    className="image"
                                    src={imageURL}
                                    alt="Page logo"
                                />
                            </div>
                        ) : null}
                        <div>
                            <PageHeaderTitle title={title} />
                        </div>
                    </div>

                    {pageControls ? (
                        <div className="header-right">{pageControls}</div>
                    ) : null}
                </div>

                {children ? (
                    <div>{children}</div>
                ) : (
                    <div className="placeholder" />
                )}
            </div>
        );
    }
}
