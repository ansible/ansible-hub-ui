import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  LoadingPageWithHeader,
  UserFormPage,
} from 'src/components';
import { mapErrorMessages } from 'src/utilities';
import { UserType, UserAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  user: UserType;
  errorMessages: object;
  unauthorized: boolean;
  redirect?: string;
}

class UserEdit extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = { user: undefined, errorMessages: {}, unauthorized: false };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];

    UserAPI.get(id)
      .then((result) =>
        this.setState({ user: result.data, unauthorized: false }),
      )
      .catch(() => this.setState({ unauthorized: true }));
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const { user, errorMessages, unauthorized } = this.state;
    const title = t`Edit user`;

    if (unauthorized) {
      return (
        <React.Fragment>
          <BaseHeader title={title}></BaseHeader>
          <EmptyStateUnauthorized />
        </React.Fragment>
      );
    }

    if (!user) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.userList, name: t`Users` },
      {
        url: formatPath(Paths.userDetail, { userID: user.id }),
        name: user.username,
      },
      { name: t`Edit` },
    ];

    return (
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
      />
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.update(user.id.toString(), user)
      .then(() => {
        //redirect to login page when password of logged user is changed
        if (this.context.user.id === user.id && user.password) {
          this.setState({ redirect: Paths.login });
        } else {
          this.setState({ redirect: Paths.userList });
        }
      })
      .catch((err) => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserEdit);
UserEdit.contextType = AppContext;
