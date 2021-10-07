import { t, Trans } from '@lingui/macro';
import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from '@patternfly/react-core';

import {
  BaseHeader,
  Main,
  ClipboardCopy,
  EmptyStateUnauthorized,
  DateComponent,
} from 'src/components';
import { ActiveUserAPI } from 'src/api';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  token: string;
}

class TokenPage extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      token: undefined,
    };
  }

  render() {
    const { token } = this.state;
    let unauthorised = !this.context.user || this.context.user.is_anonymous;
    const expiration = this.context.settings.GALAXY_TOKEN_EXPIRATION;
    const expirationDate = new Date(Date.now() + 1000 * 60 * expiration);

    return (
      <React.Fragment>
        <BaseHeader title={t`Token management`}></BaseHeader>
        <Main>
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : (
            <section className='body pf-c-content'>
              <h2>{t`API token`}</h2>
              <p>
                <Trans>
                  Use this token to authenticate the <code>ansible-galaxy</code>{' '}
                  client.
                </Trans>
              </p>
              {!this.context.user.auth_provider.includes('django') && (
                <div>
                  <h2>{t`Expiration`}</h2>
                  <p>
                    <Trans>
                      You are an SSO user. Your token will expire{' '}
                      <DateComponent date={expirationDate.toISOString()} />.
                    </Trans>
                  </p>
                </div>
              )}
              <div className='pf-c-content'>
                <Trans>
                  <b>WARNING</b> loading a new token will delete your old token.
                </Trans>
              </div>
              {token ? (
                <div>
                  <div className='pf-c-content'>
                    <Trans>
                      <b>WARNING</b> copy this token now. This is the only time
                      you will ever see it.
                    </Trans>
                  </div>
                  <ClipboardCopy>{token}</ClipboardCopy>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={() => this.loadToken()}
                  >{t`Load token`}</Button>
                </div>
              )}
            </section>
          )}
        </Main>
      </React.Fragment>
    );
  }

  private loadToken() {
    ActiveUserAPI.getToken().then((result) =>
      this.setState({ token: result.data.token }),
    );
  }
}

export default withRouter(TokenPage);

TokenPage.contextType = AppContext;
