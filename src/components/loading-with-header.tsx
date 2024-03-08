import { Skeleton, Title } from '@patternfly/react-core';
import React, { Component } from 'react';
import { LoadingPageSpinner, Main } from 'src/components';

export class LoadingPageWithHeader extends Component {
  render() {
    return (
      <>
        <section
          className={
            'pf-v5-c-page-header pf-v5-c-page__main-section pf-m-light'
          }
        >
          <Title headingLevel='h1'>
            <Skeleton />
          </Title>
        </section>
        <Main>
          <section>
            <LoadingPageSpinner />
          </section>
        </Main>
      </>
    );
  }
}
