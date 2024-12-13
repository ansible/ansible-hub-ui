import { Skeleton, Title } from '@patternfly/react-core';
import { LoadingSpinner, Main } from 'src/components';

export const LoadingPage = (_props) => (
  <>
    <section
      className={'pf-v5-c-page-header pf-v5-c-page__main-section pf-m-light'}
    >
      <Title headingLevel='h1'>
        <Skeleton />
      </Title>
    </section>
    <Main>
      <section>
        <LoadingSpinner />
      </section>
    </Main>
  </>
);
