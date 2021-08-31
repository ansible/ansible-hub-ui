import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  UserFormPage,
} from 'src/components';
import { mapErrorMessages } from 'src/utilities';
import { UserType, UserAPI } from 'src/api';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  user: UserType;
  errorMessages: object;
  redirect?: string;
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
        is_superuser: false,
      },
      errorMessages: {},
    };
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    const { user, errorMessages } = this.state;
    const notAuthorised =
      !this.context.user || !this.context.user.model_permissions.add_user;
    const breadcrumbs = [
      { url: Paths.userList, name: _`Users` },
      { name: _`Create new user` },
    ];
    const title = _`Create new user`;

    return notAuthorised ? (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        <EmptyStateUnauthorized />
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
        onCancel={() => this.setState({ redirect: Paths.userList })}
        isNewUser={true}
      ></UserFormPage>
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.create(user)
      .then((result) => this.setState({ redirect: Paths.userList }))
      .catch((err) => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserCreate);
UserCreate.contextType = AppContext;
