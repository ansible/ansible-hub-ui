import * as React from 'react';
import cx from 'classnames';
import './header.scss';

import { Title } from '@patternfly/react-core';

import { Logo } from '../../components';

interface IProps {
  title: string;
  imageURL?: string;
  breadcrumbs?: React.ReactNode;
  pageControls?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export class BaseHeader extends React.Component<IProps, {}> {
  render() {
    const { title, imageURL, pageControls, children, breadcrumbs, className } =
      this.props;
    return (
      <div className={cx('background', className)}>
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
                alt='Page logo'
                image={imageURL}
                size='50px'
              />
            ) : null}
            <div>
              <Title headingLevel='h1' size='2xl' children={title} />
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
