import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { LoginForm, LoginPage as PFLoginPage } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import Logo from '../../../static/images/galaxy_logo.svg';
import { ParamHelper } from '../../utilities/';
import { Paths } from '../../paths';
import { ActiveUserAPI } from '../../api';

interface IState {
  usernameValue: string;
  passwordValue: string;
  errorMessage: string;
  redirect?: string;
}

class LoginPage extends React.Component<RouteComponentProps, IState> {
  redirectPage: string;

  constructor(props) {
    super(props);
    this.state = {
      errorMessage: undefined,
      usernameValue: '',
      passwordValue: '',
    };

    const params = ParamHelper.parseParamString(this.props.location.search);
    this.redirectPage = params['next'] || Paths.search;
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}></Redirect>;
    }

    const helperText = (
      <span style={{ color: 'var(--pf-global--danger-color--100)' }}>
        <ExclamationCircleIcon />
        {'   '}
        {this.state.errorMessage}
      </span>
    );
    const loginForm = (
      <LoginForm
        showHelperText={!!this.state.errorMessage}
        helperText={helperText}
        usernameLabel='Username'
        usernameValue={this.state.usernameValue}
        onChangeUsername={this.handleUsernameChange}
        passwordLabel='Password'
        passwordValue={this.state.passwordValue}
        onChangePassword={this.handlePasswordChange}
        onLoginButtonClick={this.onLoginButtonClick}
      />
    );
    return (
      <PFLoginPage
        style={{
          backgroundColor: 'var(--pf-global--BackgroundColor--dark-100)',
        }}
        loginTitle='Log in to your account'
        brandImgSrc={Logo}
      >
        {loginForm}
      </PFLoginPage>
    );
  }

  private handleUsernameChange = value => {
    this.setState({ usernameValue: value });
  };

  private handlePasswordChange = passwordValue => {
    this.setState({ passwordValue });
  };

  private onLoginButtonClick = event => {
    ActiveUserAPI.login(this.state.usernameValue, this.state.passwordValue)
      .then(result => {
        ActiveUserAPI.getUser()
          .then(() => this.setState({ redirect: this.redirectPage }))
          .catch(() =>
            this.setState({
              passwordValue: '',
              errorMessage: 'Failed to retrieve user data.',
            }),
          );
      })
      .catch(result => {
        if (result.response.status.toString().startsWith('5')) {
          this.setState({
            passwordValue: '',
            errorMessage: 'Server error. Please come back later.',
          });
        } else {
          this.setState({
            passwordValue: '',
            errorMessage: 'Invalid login credentials.',
          });
        }
      });

    event.preventDefault();
  };
}

export default withRouter(LoginPage);
