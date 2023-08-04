import { t } from '@lingui/macro';
import React from 'react';
import { BaseHeader, Main } from 'src/components';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';

export const Dispatch = (props: RouteProps) => {
  const { pathname } = ParamHelper.parseParamString(props.location.search) as {
    pathname: string;
  };

  // TODO query collections and legacy roles apis, show links if exists

  return (
    <>
      <BaseHeader title={t`404 - Page not found`} />
      <Main>
        <section className='body'>
          <div>{t`We couldn't find the page you're looking for!`}</div>
          <div className='pf-c-content'>{pathname}</div>
        </section>
      </Main>
    </>
  );
};

export default withRouter(Dispatch);
