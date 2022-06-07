import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { Button, Divider } from '@patternfly/react-core';
import { LoginForm, LoginPage as PFLoginPage } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import Logo from 'src/../static/images/logo_large.svg';
import { ParamHelper } from 'src/utilities/';
import { Paths } from 'src/paths';
import { ActiveUserAPI } from 'src/api';
import { AppContext } from 'src/loaders/app-context';

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
    console.log('RENDER LOGIN FORM');

    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect}></Redirect>;
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
        usernameLabel={t`Username`}
        usernameValue={this.state.usernameValue}
        onChangeUsername={this.handleUsernameChange}
        passwordLabel={t`Password`}
        passwordValue={this.state.passwordValue}
        onChangePassword={this.handlePasswordChange}
        onLoginButtonClick={this.onLoginButtonClick}
        loginButtonLabel={t`Log In`}
      />
    );
    return (
      <>
        <PFLoginPage
          style={{
            backgroundColor: 'var(--pf-global--BackgroundColor--dark-100)',
          }}
          loginTitle={t`Log in to your account`}
          brandImgSrc={Logo}
        >
          {loginForm}
          <Divider component='div'></Divider>
          <Button isBlock variant='secondary' onClick={this.onGithubLoginButtonClick}>
            Login with Github
          </Button>
        </PFLoginPage>
      </>
    );
  }

  private handleUsernameChange = (value) => {
    this.setState({ usernameValue: value });
  };

  private handlePasswordChange = (passwordValue) => {
    this.setState({ passwordValue });
  };

  private onGithubLoginButtonClick = (event) => {
    // redirect to https://github.com/login/oauth/authorize?client_id=<CLIENTID>>&redirect_uri=https%3A%2F%2Fgalaxy.ansible.com%2Faccounts%2Fgithub%2Flogin%2Fcallback%2F&scope=read%3Aorg+user%3Aemail&response_type=code&state=rTeYdZ2Wlbw4
    console.log('LOGIN WITH GITHUB');

    const client_id = '3a7ae2a0618cc786fff4';
    const href = `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}`;

    window.location.replace(href);
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
        console.log('CATCH RESULT', result);
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

LoginPage.contextType = AppContext;
