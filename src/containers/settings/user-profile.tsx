import { Trans, t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import React, { Component } from 'react';
import { Navigate } from 'react-router';
import { ActiveUserAPI, type UserType } from 'src/api';
import {
  AlertList,
  type AlertType,
  LoadingPage,
  UserFormPage,
  closeAlert,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  type ErrorMessagesType,
  type RouteProps,
  mapErrorMessages,
  withRouter,
} from 'src/utilities';

interface IState {
  user: UserType;
  errorMessages: ErrorMessagesType;
  inEditMode: boolean;
  alerts: AlertType[];
  redirect?: string;
}

class UserProfile extends Component<RouteProps, IState> {
  static contextType = AppContext;

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
      .catch(() => this.setState({ redirect: formatPath(Paths.notFound) }));
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { user, errorMessages, inEditMode, alerts } = this.state;
    const { featureFlags } = this.context as IAppContextType;
    const isUserMgmtDisabled = featureFlags.external_authentication;

    if (!user) {
      return <LoadingPage />;
    }
    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <UserFormPage
          isMe
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
                  <Button
                    onClick={() => this.setState({ inEditMode: true })}
                  >{t`Edit`}</Button>
                </div>
              </div>
            )
          }
        />
      </>
    );
  }

  private saveUser = () => {
    const {
      user,
      user: { username },
      alerts,
    } = this.state;
    ActiveUserAPI.saveUser(user)
      .then((result) => {
        this.setState(
          {
            inEditMode: false,
            alerts: alerts.concat([
              {
                variant: 'success',
                title: (
                  <Trans>Saved changes to user &quot;{username}&quot;.</Trans>
                ),
              },
            ]),
          },
          () => (this.context as IAppContextType).setUser(result.data),
        );
        // redirect to login page when password is changed
        // SSO not relevant, user edit disabled
        if (user.password) {
          this.setState({ redirect: formatPath(Paths.login) });
        }
      })
      .catch((err) => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserProfile);
