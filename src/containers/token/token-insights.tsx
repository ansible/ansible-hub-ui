import { Trans, t } from '@lingui/macro';
import {
  Alert,
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
} from '@patternfly/react-core';
import React, { Component } from 'react';
import { MyDistributionAPI } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  ExternalLink,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, errorMessage, withRouter } from 'src/utilities';
import { getRepoURL } from 'src/utilities';

interface IState {
  alerts: AlertType[];
  synclistBasePath?: string;
  tokenData?: {
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

class TokenInsights extends Component<RouteProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      synclistBasePath: null,
      tokenData: null,
    };
  }

  componentDidMount() {
    this.getTokenData();
    this.getSynclistBasePath();
  }

  getTokenData() {
    if (!window.insights?.chrome) {
      // outside insights platform
      return;
    }

    // this function will fail if chrome.auth.doOffline() hasn't been called
    // so it never works the first time .. loadToken() causes a reload and then it works => no error handling
    window.insights.chrome.auth
      .getOfflineToken()
      .then(({ data: tokenData }) => this.setState({ tokenData }));
  }

  getSynclistBasePath() {
    MyDistributionAPI.list()
      .then(({ data }) => {
        const syncDistro = data.data.find(({ base_path }) =>
          base_path.includes('synclist'),
        );
        this.setState({
          synclistBasePath: syncDistro?.base_path,
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.setState({
          synclistBasePath: null,
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

  render() {
    const { alerts, synclistBasePath, tokenData } = this.state;
    const renewTokenCmd = `curl https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token -d grant_type=refresh_token -d client_id="cloud-services" -d refresh_token="${
      tokenData?.refresh_token ?? '{{ user_token }}'
    }" --fail --silent --show-error --output /dev/null`;

    return (
      <>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader title={t`Connect to Hub`} />
        <Main>
          <section className='pf-v5-c-content'>
            <section className='body'>
              <h2>{t`Connect Private Automation Hub`}</h2>
              <p>
                <Trans>
                  Use the Server URL below to sync certified collections to the
                  Red Hat Certified repository in your private Automation Hub.
                  If you wish to sync validated content, you can add a remote
                  with a server url pointed to the validated repo.
                </Trans>
              </p>
            </section>
            <section className='body'>
              <h2>{t`Connect the ansible-galaxy client`}</h2>
              <p>
                <Trans>
                  Documentation on how to configure the{' '}
                  <code>ansible-galaxy</code> client can be found{' '}
                  <ExternalLink href={UI_DOCS_URL}>here</ExternalLink>. Use the
                  following parameters to configure the client.
                </Trans>
              </p>
            </section>
            <section className='body'>
              <h2>{t`Offline token`}</h2>
              <p>
                <Trans>
                  Use this token to authenticate clients that need to download
                  content from Automation Hub. This is a secret token used to
                  protect your content. Store your API token in a secure
                  location.
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
              <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
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
                <ExternalLink href='https://sso.redhat.com/auth/realms/redhat-external/account/#/applications'>
                  offline API token management
                </ExternalLink>{' '}
                page.
              </Trans>
            </section>
            <section className='body'>
              <h2>{t`Server URL`}</h2>
              <p>
                <Trans>
                  Use this URL to configure the API endpoints that clients need
                  to download <strong>certified</strong> content from Automation
                  Hub.{' '}
                </Trans>
              </p>
              <ClipboardCopy isReadOnly>
                {getRepoURL('published', true)}
              </ClipboardCopy>
              <p style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
                <Trans>
                  Use this URL for <strong>validated</strong> content from
                  Automation Hub.{' '}
                </Trans>
              </p>
              <ClipboardCopy isReadOnly>
                {getRepoURL('validated')}
              </ClipboardCopy>
              <p style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
                <Trans>
                  Synclists are deprecated in AAP 2.4 and will be removed in a
                  future release, use client-side <code>requirements.yml</code>{' '}
                  instead.
                  <br />
                  If you&apos;re using sync toggles with AAP 2.3 or older, you
                  will need to use a different URL:
                </Trans>
              </p>
              {synclistBasePath ? (
                <ClipboardCopy isReadOnly>
                  {getRepoURL(synclistBasePath)}
                </ClipboardCopy>
              ) : (
                <Alert
                  variant='danger'
                  isInline
                  title={t`Synclist distribution was not found.`}
                  className='hub-content-alert-fix'
                />
              )}
            </section>
            <section className='body'>
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
            <section className='body'>
              <h2>{t`CRC public key`}</h2>
              <p>
                <Trans>
                  We use a number of keys to sign our software packages. The
                  necessary public keys are included in the relevant products
                  and are used to automatically verify software updates. You can
                  also verify the packages manually using the keys on this page.
                  More information can be found{' '}
                  <ExternalLink href='https://access.redhat.com/security/team/key'>
                    here.
                  </ExternalLink>
                </Trans>
              </p>
            </section>
          </section>
        </Main>
      </>
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
