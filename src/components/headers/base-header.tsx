import { Title } from '@patternfly/react-core';
import cx from 'classnames';
import React, { ReactNode, useEffect } from 'react';
import { useContext } from 'src/loaders/app-context';
import './header.scss';

interface IProps {
  breadcrumbs?: ReactNode;
  children?: ReactNode;
  className?: string;
  contextSelector?: ReactNode;
  logo?: ReactNode;
  pageControls?: ReactNode;
  status?: ReactNode;
  subTitle?: ReactNode;
  title: string;
  versionControl?: ReactNode;
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
  subTitle,
}: IProps) => {
  const { updateTitle } = useContext();
  useEffect(() => {
    updateTitle(title);
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
            {subTitle}
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
