import * as React from 'react';

import { Skeleton, Title } from '@patternfly/react-core';

import { Main, LoadingPageSpinner } from 'src/components';

export class LoadingPageWithHeader extends React.Component<{}> {
  render() {
    return (
      <React.Fragment>
        <section
          className={
            'pf-l-page-header pf-c-page-header pf-l-page__main-section pf-c-page__main-section pf-m-light'
          }
        >
          <Title headingLevel='h1'>
            <Skeleton></Skeleton>
          </Title>
        </section>
        <Main>
          <section>
            <LoadingPageSpinner></LoadingPageSpinner>
          </section>
        </Main>
      </React.Fragment>
    );
  }
}
