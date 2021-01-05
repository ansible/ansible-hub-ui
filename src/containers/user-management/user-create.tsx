import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorised,
  UserFormPage,
} from '../../components';
import { mapErrorMessages } from '../../utilities';
import { UserType, UserAPI } from '../../api';
import { Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';

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
    const redirect =
      !this.context.user || !this.context.user.model_permissions.add_user;
    const breadcrumbs = [
      { url: Paths.userList, name: 'Users' },
      { name: 'Create new user' },
    ];
    const title = 'Create new user';

    return redirect ? (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        <EmptyStateUnauthorised />
      </React.Fragment>
    ) : (
      <UserFormPage
        user={user}
        breadcrumbs={breadcrumbs}
        title={title}
        errorMessages={errorMessages}
        updateUser={(user, errorMessages) =>
          this.setState({ user: user, errorMessages: errorMessages })
        }
        saveUser={this.saveUser}
        onCancel={() => this.props.history.push(Paths.userList)}
        isNewUser={true}
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
UserCreate.contextType = AppContext;
