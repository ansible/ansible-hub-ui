import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

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
import { mapErrorMessages } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  user: UserType;
  errorMessages: object;
  inEditMode: boolean;
  alerts: AlertType[];
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
    const id = this.props.match.params['userID'];
    ActiveUserAPI.getUser()
      .then((result) => {
        // The api doesn't return a value for the password, so set a blank one here
        // to keep react from getting confused
        result.password = '';
        this.initialState = { ...result };
        this.setState({ user: result });
      })
      .catch(() => this.props.history.push(Paths.notFound));
  }

  render() {
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
          breadcrumbs={[{ name: _`Settings` }, { name: _`My profile` }]}
          title={_`My profile`}
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
                    {_`Edit`}
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
    const { user } = this.state;
    ActiveUserAPI.saveUser(user)
      .then((result) => {
        this.setState(
          {
            inEditMode: false,
            alerts: this.state.alerts.concat([
              { variant: 'success', title: _`Profile saved.` },
            ]),
          },
          () => this.context.setUser(result.data),
        );
        //redirect to login page when password is changed
        if (user.password) {
          this.props.history.push(Paths.login);
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
