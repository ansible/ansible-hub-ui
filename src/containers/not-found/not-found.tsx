import { t } from '@lingui/macro';
import { Bullseye } from '@patternfly/react-core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import NotFoundImage from 'src/../static/images/not_found.svg';
import { BaseHeader, Main } from 'src/components';
import './not-found.scss';

class NotFound extends React.Component<RouteComponentProps, {}> {
  render() {
    return (
      <React.Fragment>
        <BaseHeader title='404 - Page not found'></BaseHeader>
        <Main>
          <section className='body'>
            <Bullseye className='bullseye'>
              <div className='bullseye-center'>
                <img src={NotFoundImage} alt={t`Not found image`} />
                <div>{t`We couldn't find the page you're looking for!`}</div>
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
