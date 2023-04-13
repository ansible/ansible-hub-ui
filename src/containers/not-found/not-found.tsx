import { t } from '@lingui/macro';
import { Bullseye } from '@patternfly/react-core';
import React from 'react';
import NotFoundImage from 'src/../static/images/not_found.svg';
import { BaseHeader, Main } from 'src/components';
import { withRouter } from 'src/utilities';
import './not-found.scss';

export const NotFound = (_props) => (
  <>
    <BaseHeader title={t`404 - Page not found`} />
    <Main>
      <section className='body'>
        <Bullseye className='hub-c-bullseye'>
          <div className='hub-c-bullseye__center'>
            <img src={NotFoundImage} alt={t`Not found image`} />
            <div>{t`We couldn't find the page you're looking for!`}</div>
            <div className='pf-c-content'>
              <span className='hub-c-bullseye__404'>404</span>
            </div>
          </div>
        </Bullseye>
      </section>
    </Main>
  </>
);

export default withRouter(NotFound);
