import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { LoadingPageWithHeader } from '../../components';
import { UserFormPage, mapErrorMessages } from './user-form-page';
import { UserType, UserAPI } from '../../api';
import { Paths, formatPath } from '../../paths';

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
        groups: [],
      },
      errorMessages: {},
    };
  }

  render() {
    const { user, errorMessages } = this.state;
    console.log(user);
    return (
      <UserFormPage
        user={user}
        breadcrumbs={[
          { url: Paths.userList, name: 'Users' },
          { name: 'Create new user' },
        ]}
        title='Create new user'
        errorMessages={errorMessages}
        updateUser={user => this.setState({ user: user })}
        saveUser={this.saveUser}
        onCancel={() => this.props.history.push(Paths.userList)}
      ></UserFormPage>
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.create(user)
      .then(result => this.props.history.push(Paths.userList))
      .catch(err => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserCreate);
