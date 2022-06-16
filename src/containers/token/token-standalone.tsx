import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './token.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Card, CardTitle, CardBody } from '@patternfly/react-core';

import {
  BaseHeader,
  Main,
  ClipboardCopy,
  EmptyStateUnauthorized,
  DateComponent,
  AlertList,
  AlertType,
  closeAlertMixin,
  LoadingPageWithHeader,
  LoadingPageSpinner,
} from 'src/components';
import { ActiveUserAPI } from 'src/api';
import { AppContext } from 'src/loaders/app-context';
import { errorMessage } from 'src/utilities';

interface IState {
  token: string;
  alerts: AlertType[];
  loading: boolean;
  loadingToken: boolean;
}

class TokenPage extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      token: undefined,
      alerts: [],
      loading: true,
      loadingToken: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  render() {
    const { token, alerts, loading, loadingToken } = this.state;
    const unauthorised = !this.context.user || this.context.user.is_anonymous;
    const expiration = this.context.settings.GALAXY_TOKEN_EXPIRATION;
    const expirationDate = new Date(Date.now() + 1000 * 60 * expiration);

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`API token management`}></BaseHeader>
        <Main>
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : (
            <Card>
              <section className='body pf-c-content'>
                <CardTitle>
                  <h2>{t`API token`}</h2>
                </CardTitle>
                <CardBody>
                  <p>
                    <Trans>
                      Use this token to authenticate the{' '}
                      <code>ansible-galaxy</code> client.
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
                      <b>WARNING</b> loading a new token will delete your old
                      token.
                    </Trans>
                  </div>
                  {token ? (
                    <div>
                      <CardBody>
                        <div className='pf-c-content'>
                          <Trans>
                            <b>WARNING</b> copy this token now. This is the only
                            time you will ever see it.
                          </Trans>
                        </div>
                      </CardBody>
                      <ClipboardCopy>{token}</ClipboardCopy>
                    </div>
                  ) : !token && !loadingToken ? (
                    <div className='load-token'>
                      <Button
                        onClick={() => this.loadToken()}
                      >{t`Load token`}</Button>
                    </div>
                  ) : (
                    <LoadingPageSpinner />
                  )}
                </CardBody>
              </section>
            </Card>
          )}
        </Main>
      </React.Fragment>
    );
  }

  private loadToken() {
    this.setState({ loadingToken: true }, () => {
      ActiveUserAPI.getToken()
        .then((result) =>
          this.setState({ token: result.data.token, loadingToken: false }),
        )
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Token could not be displayed.`,
                description: errorMessage(status, statusText),
              },
            ],
            loadingToken: false,
          });
        });
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(TokenPage);

TokenPage.contextType = AppContext;
