import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, NotImplemented } from '../../components';

// renders list of contents in a collection
class CollectionContent extends React.Component<RouteComponentProps, {}> {
    render() {
        return (
            <React.Fragment>
                <BaseHeader title='Collection Content' />
                <Main>
                    <Section className='body'>
                        <NotImplemented></NotImplemented>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(CollectionContent);
