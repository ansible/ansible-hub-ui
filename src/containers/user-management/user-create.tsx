import { t } from '@lingui/macro';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { UserType, UserAPI } from 'src/api';
import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  UserFormPage,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  mapErrorMessages,
  ErrorMessagesType,
  withRouter,
  RouteProps,
} from 'src/utilities';

interface IState {
  user: UserType;
  errorMessages: ErrorMessagesType;
  redirect?: string;
}

class UserCreate extends React.Component<RouteProps, IState> {
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
    const { hasPermission } = this.context;
    const { user, errorMessages } = this.state;
    const notAuthorised =
      !this.context.user || !hasPermission('galaxy.add_user');
    const breadcrumbs = [
      { url: formatPath(Paths.userList), name: t`Users` },
      { name: t`Create new user` },
    ];
    const title = t`Create new user`;

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
        onCancel={() => this.setState({ redirect: formatPath(Paths.userList) })}
        isNewUser={true}
      ></UserFormPage>
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
UserCreate.contextType = AppContext;
