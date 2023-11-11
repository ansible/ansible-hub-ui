import cx from 'classnames';
import React from 'react';

interface IProps extends React.HTMLProps<HTMLElement> {
  children: React.ReactNode;
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
