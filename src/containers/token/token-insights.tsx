import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { ClipboardCopy, Button } from '@patternfly/react-core';

import { BaseHeader, Main } from '../../components';
import { getRepoUrl } from '../../utilities';

interface IState {
  tokenData: {
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_expires_in: number;
    refresh_token: string;
    scope: string;
    session_state: string;
    token_type: string;
  };
}

class TokenPage extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      tokenData: undefined,
    };
  }

  componentDidMount() {
    // this function will fail if chrome.auth.doOffline() hasn't been called
    (window as any).insights.chrome.auth.getOfflineToken().then(result => {
      this.setState({ tokenData: result.data });
    });
  }

  render() {
    const { tokenData } = this.state;

    return (
      <React.Fragment>
        <BaseHeader title='Connect to Hub'></BaseHeader>
        <Main>
          <Section className='body pf-c-content'>
            <h2>Offline token</h2>
            <p>
              Use this token to authenticate the <code>ansible-galaxy</code>{' '}
              client.
            </p>
            {tokenData ? (
              <div>
                <ClipboardCopy>{tokenData.refresh_token}</ClipboardCopy>
              </div>
            ) : (
              <Button onClick={() => this.loadToken()}>Load token</Button>
            )}
            <h2>Manage tokens</h2>
            To remove an existing token, visit{' '}
            <a
              href='https://sso.redhat.com/auth/realms/redhat-external/account/'
              target='_blank'
            >
              Red Hat SSO account management
            </a>
            .
          </Section>
          <Section className='body pf-c-content'>
            <h2>Server URL</h2>
            <p>
              Use this URL to configure Galaxy server in your the{' '}
              <code>ansible-galaxy</code> client.
            </p>
            <ClipboardCopy isReadOnly>{getRepoUrl('')}</ClipboardCopy>
          </Section>
          <Section className='body pf-c-content'>
            <h2>SSO URL</h2>
            <p>
              Use this URL to authenticate the <code>ansible-galaxy</code>{' '}
              client.{' '}
            </p>
            <ClipboardCopy isReadOnly>
              https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
            </ClipboardCopy>
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private loadToken() {
    (window as any).insights.chrome.auth
      // doOffline causes the page to refresh and will make the data
      // available to getOfflineToken() when the component mounts after
      // the reload
      .doOffline();
  }
}

export default withRouter(TokenPage);
