import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { BaseHeader } from '../../components/headers/base-header';
import { NotImplemented } from '../../components/not-implemented/not-implemented';

import { Main, Section } from '@redhat-cloud-services/frontend-components';

class MyCollections extends React.Component<RouteComponentProps, {}> {
    render() {
        return (
            <React.Fragment>
                <BaseHeader title='My Collections' />
                <Main>
                    <Section className='body'>
                        <NotImplemented></NotImplemented>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(MyCollections);
