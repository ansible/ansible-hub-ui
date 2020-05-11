import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { LoginForm, LoginPage as PFLoginPage } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import Logo from '../../../static/images/galaxy_logo.svg';
import { ParamHelper } from '../../utilities/';
import { Paths } from '../../paths';
import { ActiveUserAPI } from '../../api';

interface IState {
  showHelperText: boolean;
  usernameValue: string;
  passwordValue: string;
  redirect?: string;
}

class LoginPage extends React.Component<RouteComponentProps, IState> {
  redirectPage: string;

  constructor(props) {
    super(props);
    this.state = {
      showHelperText: false,
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
        {'   '}Invalid login credentials.
      </span>
    );
    const loginForm = (
      <LoginForm
        showHelperText={this.state.showHelperText}
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
        ActiveUserAPI.getUser().then(() =>
          this.setState({ redirect: this.redirectPage }),
        );
      })
      .catch(result =>
        this.setState({ passwordValue: '', showHelperText: true }),
      );

    event.preventDefault();
  };
}

export default withRouter(LoginPage);
