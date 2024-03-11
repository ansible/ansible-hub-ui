import cx from 'classnames';
import React, { type HTMLProps, ReactNode } from 'react';

interface IProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export const Main = ({ children, className, ...extra }: IProps) => (
  <section className={cx('pf-v5-c-page__main-section', className)} {...extra}>
    {children}
  </section>
);
