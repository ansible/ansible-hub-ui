import { t } from '@lingui/macro';
import * as React from 'react';
import cx from 'classnames';
import './header.scss';

import { Title } from '@patternfly/react-core';
import { Logo } from 'src/components';

interface IProps {
  title: string;
  imageURL?: string;
  breadcrumbs?: React.ReactNode;
  pageControls?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contextSelector?: React.ReactNode;
  versionControl?: React.ReactNode;
  status?: React.ReactNode;
}

export class BaseHeader extends React.Component<IProps, {}> {
  render() {
    const {
      title,
      imageURL,
      pageControls,
      children,
      breadcrumbs,
      className,
      contextSelector,
      versionControl,
      status,
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
                alt={t`Page logo`}
                image={imageURL}
                size='40px'
                unlockWidth={true}
              />
            ) : null}
            <div>
              <Title headingLevel='h1' size='2xl'>
                {' '}
                {title} {status}{' '}
              </Title>
            </div>
          </div>
          {pageControls ? (
            <div className='header-right'>{pageControls}</div>
          ) : null}
        </div>
        {versionControl ? <>{versionControl}</> : null}

        {children ? (
          <div className='header-bottom'>{children}</div>
        ) : (
          <div className='placeholder' />
        )}
      </div>
    );
  }
}
