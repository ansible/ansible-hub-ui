import { Title } from '@patternfly/react-core';
import cx from 'classnames';
import * as React from 'react';
import './header.scss';

interface IProps {
  title: string;
  logo?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  pageControls?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contextSelector?: React.ReactNode;
  versionControl?: React.ReactNode;
  status?: React.ReactNode;
}

export class BaseHeader extends React.Component<IProps> {
  render() {
    const {
      title,
      logo,
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
        {contextSelector || null}
        {breadcrumbs && (
          <div className='breadcrumb-container'>{breadcrumbs}</div>
        )}
        {!breadcrumbs && !contextSelector && <div className='placeholder' />}

        <div className='column-section'>
          <div className='title-box'>
            {logo}
            <div>
              <Title headingLevel='h1' size='2xl'>
                {title}
                {status}
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
