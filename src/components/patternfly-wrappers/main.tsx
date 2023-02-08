import cx from 'classnames';
import * as React from 'react';

interface IProps extends React.HTMLProps<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export class Main extends React.Component<IProps> {
  render() {
    const { children, className, ...extra } = this.props;
    return (
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
  }
}
