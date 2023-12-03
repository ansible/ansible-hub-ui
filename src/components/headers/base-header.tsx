import { Title } from '@patternfly/react-core';
import cx from 'classnames';
import React, { useEffect } from 'react';
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

export const BaseHeader = ({
  title,
  logo,
  pageControls,
  children,
  breadcrumbs,
  className,
  contextSelector,
  versionControl,
  status,
}: IProps) => {
  useEffect(() => {
    document.title = title
      ? `${APPLICATION_NAME} - ${title}`
      : APPLICATION_NAME;
  }, [title]);

  return (
    <div className={cx('background', className)}>
      {contextSelector || null}
      {breadcrumbs && <div className='breadcrumb-container'>{breadcrumbs}</div>}
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
        {pageControls || null}
      </div>
      {versionControl || null}

      {children ? (
        <div className='hub-header-bottom'>{children}</div>
      ) : (
        <div className='placeholder' />
      )}
    </div>
  );
};
