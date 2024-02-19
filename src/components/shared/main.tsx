import cx from 'classnames';
import React, { HTMLProps, ReactNode } from 'react';

interface IProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export const Main = ({ children, className, ...extra }: IProps) => (
  <section
    className={cx(
      'pf-l-page__main-section',
      'pf-c-page__main-section',
      className,
    )}
    {...extra}
  >
    {children}
  </section>
);
