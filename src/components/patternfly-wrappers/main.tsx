import * as React from 'react';
import cx from 'classnames';

export class Main extends React.Component<React.HTMLProps<HTMLElement>> {
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
