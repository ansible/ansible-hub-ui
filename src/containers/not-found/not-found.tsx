import { t } from '@lingui/macro';
import * as React from 'react';
import './not-found.scss';
import NotFoundImage from 'src/../static/images/not_found.svg';

import { RouteProps, withRouter } from 'src/utilities';
import { Bullseye } from '@patternfly/react-core';

import { BaseHeader, Main } from 'src/components';

class NotFound extends React.Component<RouteProps> {
  render() {
    return (
      <React.Fragment>
        <BaseHeader title='404 - Page not found'></BaseHeader>
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
      </React.Fragment>
    );
  }
}

export default withRouter(NotFound);
