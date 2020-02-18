import * as React from 'react';

import {
    Skeleton,
    PageHeaderTitle,
    PageHeader,
    Section,
} from '@redhat-cloud-services/frontend-components';

import { Main } from '../../components';

import { LoadingPageSpinner } from '../../components';

export class LoadingPageWithHeader extends React.Component<{}> {
    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle
                        title={<Skeleton size='sm'></Skeleton>}
                    ></PageHeaderTitle>
                </PageHeader>
                <Main>
                    <Section>
                        <LoadingPageSpinner></LoadingPageSpinner>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}
