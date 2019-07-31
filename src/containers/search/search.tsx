import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { BaseHeader } from '../../components/headers/base-header';
import { NotImplemented } from '../../components/not-implemented/not-implemented';

import { Main, Section } from '@redhat-cloud-services/frontend-components';

class Search extends React.Component<RouteComponentProps, {}> {
    render() {
        const p = new URLSearchParams(this.props.location.search);
        p.forEach((v, k) => console.log(v, k));
        return (
            <React.Fragment>
                <BaseHeader title='Search' />
                <Main>
                    <Section className='body'>
                        <NotImplemented></NotImplemented>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(Search);
