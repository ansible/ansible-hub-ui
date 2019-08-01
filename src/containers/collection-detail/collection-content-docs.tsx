import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { BaseHeader, NotImplemented } from '../../components';

import { Main, Section } from '@redhat-cloud-services/frontend-components';

class CollectionContentDocs extends React.Component<RouteComponentProps, {}> {
    render() {
        return (
            <React.Fragment>
                <BaseHeader title='Collection Content Docs' />
                <Main>
                    <Section className='body'>
                        <NotImplemented></NotImplemented>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(CollectionContentDocs);
