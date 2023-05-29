import { Trans, t } from '@lingui/macro';
import { Button, ClipboardCopyVariant } from '@patternfly/react-core';
import React from 'react';
import { MyDistributionAPI } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  ClipboardCopy,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';
import { errorMessage, getRepoURL } from 'src/utilities';

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
  alerts: AlertType[];
  repoUrl: string;
}

class TokenInsights extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      tokenData: undefined,
      alerts: [],
      repoUrl: '',
    };
  }

  private getMyDistributionPath() {
    MyDistributionAPI.list()
      .then(({ data }) => {
        const syncDistro =
          data.data.find(({ base_path }) => base_path.includes('synclist'))
            ?.base_path || '';
        this.setState({
          repoUrl: syncDistro,
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.setState({
          repoUrl: '',
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Server URL could not be displayed.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  componentDidMount() {
    // this function will fail if chrome.auth.doOffline() hasn't been called
    // so it never works the first time .. loadToken() causes a reload and then it works => no error handling
    window.insights.chrome.auth.getOfflineToken().then((result) => {
      this.setState({ tokenData: result.data });
    });

    this.getMyDistributionPath();
  }

  render() {
    const { tokenData, alerts } = this.state;
    const renewTokenCmd = `curl https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token -d grant_type=refresh_token -d client_id="cloud-services" -d refresh_token="${
      tokenData?.refresh_token ?? '{{ user_token }}'
    }" --fail --silent --show-error --output /dev/null`;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Connect to Hub`}></BaseHeader>
        <Main>
          <section className='body pf-c-content'>
            <h2>{t`Connect Private Automation Hub`}</h2>
            <p>
              <Trans>
                Use the Server URL below to sync certified collections to the
                Red Hat Certified repository in your private Automation Hub. If
                you wish to sync validated content, you can add a remote with a
                server url pointed to the validated repo.
              </Trans>
            </p>
          </section>
          <section className='body pf-c-content'>
            <h2>{t`Connect the ansible-galaxy client`}</h2>
            <p>
              <Trans>
                Documentation on how to configure the{' '}
                <code>ansible-galaxy</code> client can be found{' '}
                <a
                  href='https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/'
                  target='_blank'
                  rel='noreferrer'
                >
                  here
                </a>
                . Use the following parameters to configure the client.
              </Trans>
            </p>
          </section>
          <section className='body pf-c-content'>
            <h2>{t`Offline token`}</h2>
            <p>
              <Trans>
                Use this token to authenticate clients that need to download
                content from Automation Hub. This is a secret token used to
                protect your content. Store your API token in a secure location.
              </Trans>
            </p>
            {tokenData ? (
              <div>
                <ClipboardCopy>{tokenData.refresh_token}</ClipboardCopy>
              </div>
            ) : (
              <div>
                <Button
                  onClick={() => this.loadToken()}
                >{t`Load token`}</Button>
              </div>
            )}
            <div
              className='pf-c-content'
              style={{ paddingTop: 'var(--pf-global--spacer--md)' }}
            >
              <span>
                <Trans>
                  The token will expire after 30 days of inactivity. Run the
                  command below periodically to prevent your token from
                  expiring.
                </Trans>
              </span>
              <ClipboardCopy
                isCode
                isReadOnly
                variant={ClipboardCopyVariant.expansion}
              >
                {renewTokenCmd}
              </ClipboardCopy>
            </div>
            <h2>{t`Manage tokens`}</h2>
            <Trans>
              To revoke a token or see all of your tokens, visit the{' '}
              <a
                href='https://sso.redhat.com/auth/realms/redhat-external/account'
                target='_blank'
                rel='noreferrer'
              >
                offline API token management
              </a>{' '}
              page.
            </Trans>
          </section>
          <section className='body pf-c-content'>
            <h2>{t`Server URL`}</h2>
            <p>
              <Trans>
                Use this URL to configure the API endpoints that clients need to
                download certified content from Automation Hub. Synclists are
                deprecated in AAP 2.4 and will be removed in a future release,
                instead use client-side requirements.yml, see AAP 2.4
                documentation.
              </Trans>
            </p>
            <ClipboardCopy isReadOnly>
              {getRepoURL('published', true)}
            </ClipboardCopy>
          </section>
          <section className='body pf-c-content'>
            <h2>{t`SSO URL`}</h2>
            <p>
              <Trans>
                Use this URL to configure the authentication URLs that clients
                need to download content from Automation Hub.
              </Trans>
            </p>
            <ClipboardCopy isReadOnly>
              https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
            </ClipboardCopy>
          </section>
          <section className='body pf-c-content'>
            <h2>{t`CRC public key`}</h2>
            <p>
              <Trans>
                We use a number of keys to sign our software packages. The
                necessary public keys are included in the relevant products and
                are used to automatically verify software updates. You can also
                verify the packages manually using the keys on this page. More
                information can be found{' '}
                <a
                  href='https://access.redhat.com/security/team/key'
                  target='_blank'
                  rel='noreferrer'
                >
                  here.
                </a>
              </Trans>
            </p>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadToken() {
    // doOffline causes the page to refresh and will make the data
    // available to getOfflineToken() when the component mounts after
    // the reload
    window.insights.chrome.auth.doOffline();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(TokenInsights);
TokenInsights.contextType = AppContext;
