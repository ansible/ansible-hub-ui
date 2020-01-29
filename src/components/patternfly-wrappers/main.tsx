import * as React from 'react';

export class Main extends React.Component<any> {
    render() {
        const { children, className, ...extra } = this.props;
        return (
            <section
                className={
                    'pf-l-page__main-section pf-c-page__main-section ' +
                    className
                }
                {...extra}
            >
                {children}
            </section>
        );
    }
}
