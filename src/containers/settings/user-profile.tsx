import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { Button } from '@patternfly/react-core';

import {
  LoadingPageWithHeader,
  UserFormPage,
  AlertType,
  AlertList,
  closeAlertMixin,
} from 'src/components';
import { UserType, ActiveUserAPI } from 'src/api';
import { Paths } from 'src/paths';
import { mapErrorMessages, ErrorMessagesType } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  user: UserType;
  errorMessages: ErrorMessagesType;
  inEditMode: boolean;
  alerts: AlertType[];
  redirect?: string;
}

class UserProfile extends React.Component<RouteComponentProps, IState> {
  private initialState: UserType;

  constructor(props) {
    super(props);

    this.state = {
      user: undefined,
      errorMessages: {},
      inEditMode: false,
      alerts: [],
    };
  }

  componentDidMount() {
    ActiveUserAPI.getUser()
      .then((result) => {
        // The api doesn't return a value for the password, so set a blank one here
        // to keep react from getting confused
        const extendedResult = { ...result, password: '' };
        this.initialState = { ...extendedResult };
        this.setState({ user: extendedResult });
      })
      .catch(() => this.setState({ redirect: Paths.notFound }));
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const { user, errorMessages, inEditMode, alerts } = this.state;
    const { featureFlags } = this.context;
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }

    if (!user) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }
    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <UserFormPage
          isMe={true}
          user={user}
          breadcrumbs={[{ name: t`Settings` }, { name: t`My profile` }]}
          title={t`My profile`}
          errorMessages={errorMessages}
          updateUser={(user) => this.setState({ user: user })}
          saveUser={this.saveUser}
          isReadonly={!inEditMode}
          onCancel={() =>
            this.setState({
              user: this.initialState,
              inEditMode: false,
              errorMessages: {},
            })
          }
          extraControls={
            !inEditMode &&
            !isUserMgmtDisabled && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div>
                  <Button onClick={() => this.setState({ inEditMode: true })}>
                    {t`Edit`}
                  </Button>
                </div>
              </div>
            )
          }
        ></UserFormPage>
      </>
    );
  }

  private saveUser = () => {
    const { user, alerts } = this.state;
    ActiveUserAPI.saveUser(user)
      .then((result) => {
        this.setState(
          {
            inEditMode: false,
            alerts: alerts.concat([
              {
                variant: 'success',
                title: t`Saved changes to ${user.username}.`,
              },
            ]),
          },
          () => this.context.setUser(result.data),
        );
        // Redirect to login page when password is changed
        // SSO not relevant, user edit disabled
        if (user.password) {
          this.setState({ redirect: Paths.login });
        }
      })
      .catch((err) => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(UserProfile);

// For some reason react complains about setting context type in the class itself.
// I think that it happens because withRouter confuses react into thinking that the
// component is a functional compent when it's actually a class component.
UserProfile.contextType = AppContext;
