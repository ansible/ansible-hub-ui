import * as React from 'react';
import cx from 'classnames';
import './header.scss';

import { PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import { Logo } from 'src/components';

interface IProps {
  title: string;
  imageURL?: string;
  latestVersion?: string;
  breadcrumbs?: React.ReactNode;
  pageControls?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contextSelector?: React.ReactNode;
  versionControl?: React.ReactNode;
}

export class BaseHeader extends React.Component<IProps, {}> {
  render() {
    const {
      title,
      imageURL,
      latestVersion,
      pageControls,
      children,
      breadcrumbs,
      className,
      contextSelector,
      versionControl,
    } = this.props;
    return (
      <div className={cx('background', className)}>
        {contextSelector && (
          <div className='breadcrumb-container'>{contextSelector}</div>
        )}
        {breadcrumbs && (
          <div className='breadcrumb-container'>{breadcrumbs}</div>
        )}
        {!breadcrumbs && !contextSelector && <div className='placeholder' />}

        <div className='column-section'>
          <div className='title-box'>
            {imageURL ? (
              <Logo
                className='image'
                alt='Page logo'
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
        {versionControl ? (
          <div className='install-version-column'>
            <span>Version</span>
            <div className='install-version-dropdown'>{versionControl}</div>
            {latestVersion ? (
              <span className='last-updated'>Last updated {latestVersion}</span>
            ) : null}
          </div>
        ) : null}

        {children ? (
          <div className='header-bottom'>{children}</div>
        ) : (
          <div className='placeholder' />
        )}
      </div>
    );
  }
}
