import * as React from 'react';

import { Link } from 'react-router-dom';

export class NotImplemented extends React.Component<{}, {}> {
    implementedLinks = [
        '/my-namespaces/edit/red_hat',
        '/red_hat',
        '/partners',
        '/my-namespaces',
        '/my-imports',
        '/',
        '/my-namespaces/red_hat',
    ];

    render() {
        return (
            <div className='pf-c-content'>
                <h1>This page hasn't been implemented!</h1>
                <br />
                <br />
                Here's a list of pages that you can go to that do work:
                <ol>
                    {this.implementedLinks.map(x => (
                        <li key={x}>
                            <Link to={x}>{x}</Link>
                        </li>
                    ))}
                </ol>
            </div>
        );
    }
}
