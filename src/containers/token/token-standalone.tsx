import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { ClipboardCopy, Button } from '@patternfly/react-core';

import { BaseHeader, Main } from 'src/components';
import { ActiveUserAPI } from 'src/api';

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

    return (
      <React.Fragment>
        <BaseHeader title='Token management'></BaseHeader>
        <Main>
          <Section className='body pf-c-content'>
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
          </Section>
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
