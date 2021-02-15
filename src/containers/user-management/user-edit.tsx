import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorised,
  LoadingPageWithHeader,
  UserFormPage,
} from '../../components';
import { mapErrorMessages } from '../../utilities';
import { UserType, UserAPI } from '../../api';
import { Paths, formatPath } from '../../paths';
import { AppContext } from '../../loaders/app-context';

interface IState {
  user: UserType;
  errorMessages: object;
  unauthorised: boolean;
}

class UserEdit extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = { user: undefined, errorMessages: {}, unauthorised: false };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];

    UserAPI.get(id)
      .then(result => this.setState({ user: result.data, unauthorised: false }))
      .catch(() => this.setState({ unauthorised: true }));
  }

  render() {
    const { user, errorMessages, unauthorised } = this.state;
    const title = 'Edit user';

    if (unauthorised) {
      return (
        <React.Fragment>
          <BaseHeader title={title}></BaseHeader>
          <EmptyStateUnauthorised />
        </React.Fragment>
      );
    }

    if (!user) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.userList, name: 'Users' },
      {
        url: formatPath(Paths.userDetail, { userID: user.id }),
        name: user.username,
      },
      { name: 'Edit' },
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
        onCancel={() => this.props.history.push(Paths.userList)}
      />
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.update(user.id.toString(), user)
      .then(() => {
        //redirect to login page when password of logged user is changed
        if (this.context.user.id === user.id && user.password) {
          this.props.history.push(Paths.login);
        } else {
          this.props.history.push(Paths.userList);
        }
      })
      .catch(err => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserEdit);
UserEdit.contextType = AppContext;
