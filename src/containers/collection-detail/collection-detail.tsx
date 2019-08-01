import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, NotImplemented } from '../../components';

class CollectionDetail extends React.Component<RouteComponentProps, {}> {
    render() {
        return (
            <React.Fragment>
                <BaseHeader title='Collection Detail' />
                <Main>
                    <Section className='body'>
                        <NotImplemented></NotImplemented>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(CollectionDetail);
