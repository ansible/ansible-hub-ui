import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, NotImplemented } from '../../components';

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
