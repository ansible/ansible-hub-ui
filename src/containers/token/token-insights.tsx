import * as React from 'react';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { ClipboardCopy, Button } from '@patternfly/react-core';

import { Paths } from '../../paths';
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
              Use this token to authenticate clients that need to download
              content from Automation Hub. This token grants the user access to
              all apps on cloud.redhat.com, so keep it safe.
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
              Use this URL to configure the API endpoints that clients need to
              download content from Automation Hub.
            </p>
            <ClipboardCopy isReadOnly>{getRepoUrl('')}</ClipboardCopy>
          </Section>
          <Section className='body pf-c-content'>
            <h2>SSO URL</h2>
            <p>
              Use this URL to configure the authentication URLs that clients
              need to download content from Automation Hub.
            </p>
            <ClipboardCopy isReadOnly>
              https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
            </ClipboardCopy>
          </Section>
          <Section className='body pf-c-content'>
            <h2>Connect Private Automation Hub</h2>
            <p>
              The repository provided on the{' '}
              <Link to={Paths.repositories}>Repostory Management</Link> page can
              be used to sync collections into the Red Hat certified repository
              in private Automation Hub. Users with the correct permissions can
              use the sync toggles on the{' '}
              <Link to={Paths.search}>Collections</Link> page to control which
              collections are added to their organization's sync repository.
            </p>
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
