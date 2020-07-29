import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { UserFormPage } from '../../components';
import { mapErrorMessages } from '../../utilities';
import { UserType, UserAPI } from '../../api';
import { Paths } from '../../paths';

interface IState {
  user: UserType;
  errorMessages: object;
}

class UserCreate extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        // TODO: add group management to the form
        // defaulting to the admin for now to make testing easier.
        groups: [{ id: 1, name: 'system:partner-engineer' }],
      },
      errorMessages: {},
    };
  }

  render() {
    const { user, errorMessages } = this.state;
    return (
      <UserFormPage
        user={user}
        breadcrumbs={[
          { url: Paths.userList, name: 'Users' },
          { name: 'Create new user' },
        ]}
        title='Create new user'
        errorMessages={errorMessages}
        updateUser={(user, errorMessages) =>
          this.setState({ user: user, errorMessages: errorMessages })
        }
        saveUser={this.saveUser}
        onCancel={() => this.props.history.push(Paths.userList)}
      ></UserFormPage>
    );
  }
  private saveUser = passwordsMatch => {
    if (passwordsMatch) {
      this.setState({
        errorMessages: { 'password-confirm': 'Passwords do not match' },
      });
      return;
    }
    const { user } = this.state;
    UserAPI.create(user)
      .then(result => this.props.history.push(Paths.userList))
      .catch(err => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserCreate);
