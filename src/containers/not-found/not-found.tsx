import * as React from 'react';
import './not-found.scss';
// had to declare *.gif in src/index.d.ts
import NotFoundImage from '../../../static/images/not_found.svg';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Bullseye } from '@patternfly/react-core';

import { BaseHeader, Main } from '../../components';

class NotFound extends React.Component<RouteComponentProps, {}> {
  render() {
    return (
      <React.Fragment>
        <BaseHeader title='404 - Page not found'></BaseHeader>
        <Main>
          <section className='body'>
            <Bullseye className='bullseye'>
              <div className='bullseye-center'>
                <img src={NotFoundImage} alt='AWX Spud' />
                <div>We couldn't find the page you're looking for!</div>
                <div className='pf-c-content'>
                  <span className='four-oh-four'>404</span>
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
