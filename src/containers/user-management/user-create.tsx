import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAPI, UserType } from 'src/api';
import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  UserFormPage,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ErrorMessagesType,
  RouteProps,
  mapErrorMessages,
  withRouter,
} from 'src/utilities';

interface IState {
  user: UserType;
  errorMessages: ErrorMessagesType;
  redirect?: string;
}

class UserCreate extends Component<RouteProps, IState> {
  static contextType = AppContext;

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
      return <Navigate to={this.state.redirect} />;
    }
    const { hasPermission } = this.context as IAppContextType;
    const { user, errorMessages } = this.state;
    const notAuthorised =
      !(this.context as IAppContextType).user ||
      !hasPermission('galaxy.add_user');
    const breadcrumbs = [
      { url: formatPath(Paths.userList), name: t`Users` },
      { name: t`Create new user` },
    ];
    const title = t`Create new user`;

    return notAuthorised ? (
      <>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          title={title}
        />
        <EmptyStateUnauthorized />
      </>
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
        onCancel={() => this.setState({ redirect: formatPath(Paths.userList) })}
        isNewUser
      />
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.create(user)
      .then(() => this.setState({ redirect: formatPath(Paths.userList) }))
      .catch((err) => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserCreate);
