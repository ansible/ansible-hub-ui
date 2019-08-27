import * as React from 'react';
import './header.scss';

import { PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import { Logo } from '../../components';

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
            <div className='background'>
                {breadcrumbs ? (
                    <div className='breadcrumb-container'>{breadcrumbs}</div>
                ) : (
                    <div className='placeholder' />
                )}
                <div className='column-section'>
                    <div className='title-box'>
                        {imageURL ? (
                            <Logo
                                className='image'
                                alt='Page Logo'
                                image={imageURL}
                                size='50px'
                            />
                        ) : null}
                        <div>
                            <PageHeaderTitle title={title} />
                        </div>
                    </div>

                    {pageControls ? (
                        <div className='header-right'>{pageControls}</div>
                    ) : null}
                </div>

                {children ? (
                    <div className='header-bottom'>{children}</div>
                ) : (
                    <div className='placeholder' />
                )}
            </div>
        );
    }
}
