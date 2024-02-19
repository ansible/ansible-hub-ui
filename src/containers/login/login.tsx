import { t } from '@lingui/macro';
import { LoginPage as PFLoginPage } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Logo from 'src/../static/images/logo_large.svg';
import { ActiveUserAPI } from 'src/api';
import { LoginForm } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';

interface IState {
  usernameValue: string;
  passwordValue: string;
  errorMessage: string;
  redirect?: string;
}

class LoginPage extends Component<RouteProps, IState> {
  static contextType = AppContext;

  redirectPage: string;

  constructor(props) {
    super(props);
    this.state = {
      errorMessage: undefined,
      usernameValue: '',
      passwordValue: '',
    };

    const params = ParamHelper.parseParamString(this.props.location.search);
    this.redirectPage = params['next'] || formatPath(Paths.landingPage);
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const helperText = (
      <span style={{ color: 'var(--pf-global--danger-color--100)' }}>
        <ExclamationCircleIcon />
        {'   '}
        {this.state.errorMessage}
      </span>
    );

    return (
      <PFLoginPage
        style={{
          backgroundColor: 'var(--pf-global--BackgroundColor--dark-100)',
        }}
        loginTitle={t`Log in to your account`}
        brandImgSrc={Logo}
      >
        <LoginForm
          helperText={helperText}
          onChangePassword={this.handlePasswordChange}
          onChangeUsername={this.handleUsernameChange}
          onLoginButtonClick={this.onLoginButtonClick}
          passwordValue={this.state.passwordValue}
          showHelperText={!!this.state.errorMessage}
          usernameValue={this.state.usernameValue}
        />
      </PFLoginPage>
    );
  }

  private handleUsernameChange = (usernameValue) => {
    this.setState({ usernameValue });
  };

  private handlePasswordChange = (passwordValue) => {
    this.setState({ passwordValue });
  };

  private onLoginButtonClick = (event) => {
    ActiveUserAPI.login(this.state.usernameValue, this.state.passwordValue)
      .then(() => {
        ActiveUserAPI.getUser()
          .then((result) => {
            this.context.setUser(result);
            this.setState({ redirect: this.redirectPage });
          })
          .catch(() =>
            this.setState({
              passwordValue: '',
              errorMessage: t`Failed to retrieve user data.`,
            }),
          );
      })
      .catch((result) => {
        if (result.response.status.toString().startsWith('5')) {
          this.setState({
            passwordValue: '',
            errorMessage: t`Server error. Please come back later.`,
          });
        } else {
          this.setState({
            passwordValue: '',
            errorMessage: t`Invalid login credentials.`,
          });
        }
      });

    event.preventDefault();
  };
}

export default withRouter(LoginPage);
