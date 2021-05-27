import * as React from 'react';

import {
  Skeleton,
  PageHeaderTitle,
  PageHeader,
} from '@redhat-cloud-services/frontend-components';

import { Main } from 'src/components';

import { LoadingPageSpinner } from 'src/components';

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
          <section>
            <LoadingPageSpinner></LoadingPageSpinner>
          </section>
        </Main>
      </React.Fragment>
    );
  }
}
