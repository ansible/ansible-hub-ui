import * as React from 'react';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Button,
} from '@patternfly/react-core';

import { Paths } from 'src/paths';
import { BaseHeader, Main } from 'src/components';
import { getRepoUrl } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

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
    const { user } = this.context;
    const { tokenData } = this.state;
    const renewTokenCmd = `curl https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token -d grant_type=refresh_token -d client_id="${user.username}" -d refresh_token=\"${tokenData?.refresh_token ?? '{{ user_token }}'}\" --fail --silent --show-error --output /dev/null`;

    return (
      <React.Fragment>
        <BaseHeader title='Connect to Hub'></BaseHeader>
        <Main>
          <section className='body pf-c-content'>
            <h2>Connect Private Automation Hub</h2>
            <p>
              Use the <Link to={Paths.repositories}>Repository Management</Link>{' '}
              page to sync collections curated by your organization to the Red
              Hat Certified repository in your private Automation Hub. Users
              with the correct permissions can use the sync toggles on the{' '}
              <Link to={Paths.search}>Collections</Link> page to control which
              collections are added to their organization's sync repository.
            </p>
          </section>
          <section className='body pf-c-content'>
            <h2>Connect the ansible-galaxy client</h2>
            <p>
              Documentation on how to configure the <code>ansible-galaxy</code>{' '}
              client can be found{' '}
              <a
                href='https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/'
                target='_blank'
              >
                here
              </a>
              . Use the following parameters to configure the client.
            </p>
          </section>
          <section className='body pf-c-content'>
            <h2>Offline token</h2>
            <p>
              Use this token to authenticate clients that need to download
              content from Automation Hub. This is a secret token used to
              protect your content. Store your API token in a secure location.
            </p>
            {tokenData ? (
              <div>
                <ClipboardCopy>{tokenData.refresh_token}</ClipboardCopy>
              </div>
            ) : (
              <Button onClick={() => this.loadToken()}>Load token</Button>
            )}
            <div
              className='pf-c-content'
              style={{ paddingTop: 'var(--pf-global--spacer--md)' }}
            >
              <span>
                The token will expire after 30 days of inactivity. Run the
                command below periodically to prevent your token from expiring.
              </span>
              <ClipboardCopy
                isCode
                isReadOnly
                variant={ClipboardCopyVariant.expansion}
              >
                {renewTokenCmd}
              </ClipboardCopy>
            </div>
            <h2>Manage tokens</h2>
            To revoke a token or see all of your tokens, visit the{' '}
            <a
              href='https://sso.redhat.com/auth/realms/redhat-external/account/applications'
              target='_blank'
            >
              offline API token management
            </a>{' '}
            page.
          </section>
          <section className='body pf-c-content'>
            <h2>Server URL</h2>
            <p>
              Use this URL to configure the API endpoints that clients need to
              download content from Automation Hub.
            </p>
            <ClipboardCopy isReadOnly>{getRepoUrl('')}</ClipboardCopy>
            <p>
              Note: this URL contains all collections in Hub. To connect to your
              organization's sync repository use the URL found on{' '}
              <Link to={Paths.repositories}>Repository Management</Link>.
            </p>
          </section>
          <section className='body pf-c-content'>
            <h2>SSO URL</h2>
            <p>
              Use this URL to configure the authentication URLs that clients
              need to download content from Automation Hub.
            </p>
            <ClipboardCopy isReadOnly>
              https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
            </ClipboardCopy>
          </section>
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
TokenPage.contextType = AppContext;
