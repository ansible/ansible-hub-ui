import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Button,
} from '@patternfly/react-core';

import { BaseHeader, Main } from 'src/components';
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
    const { user } = this.context;
    const { token } = this.state;
    const renewTokenCmd = `curl https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token -d grant_type=refresh_token -d client_id="${user.username}" -d refresh_token=\"${token ?? '{{ user_token }}'}\" --fail --silent --show-error --output /dev/null`;

    return (
      <React.Fragment>
        <BaseHeader title='Token management'></BaseHeader>
        <Main>
          <section className='body pf-c-content'>
            <h2>API token</h2>
            <p>
              Use this token to authenticate the <code>ansible-galaxy</code>{' '}
              client.
            </p>
            <div className='pf-c-content'>
              <b>WARNING</b> loading a new token will delete your old token.
            </div>
            {token ? (
              <div>
                <div className='pf-c-content'>
                  <b>WARNING</b> copy this token now. This is the only time you
                  will ever see it.
                </div>
                <ClipboardCopy>{token}</ClipboardCopy>
              </div>
            ) : (
              <div>
                <Button onClick={() => this.loadToken()}>Load token</Button>
              </div>
            )}

            <div
              className='pf-c-content'
              style={{ paddingTop: 'var(--pf-global--spacer--md)' }}
            >
              <span>
                The token will expire after 30 days of inactivity. To renew the
                token, run the command below.
              </span>
              <ClipboardCopy
                isCode
                isReadOnly
                variant={ClipboardCopyVariant.expansion}
              >
                {renewTokenCmd}
              </ClipboardCopy>
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadToken() {
    ActiveUserAPI.getToken().then(result =>
      this.setState({ token: result.data.token }),
    );
  }
}

export default withRouter(TokenPage);
TokenPage.contextType = AppContext;
