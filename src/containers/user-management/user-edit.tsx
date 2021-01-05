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
}

class UserEdit extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = { user: undefined, errorMessages: {} };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];
    UserAPI.get(id)
      .then(result => this.setState({ user: result.data }))
      .catch(() => this.props.history.push(Paths.notFound));
  }

  render() {
    const { user, errorMessages } = this.state;

    if (!user) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const redirect =
      !this.context.user || !this.context.user.model_permissions.change_user;
    const title = 'Edit user';
    const breadcrumbs = [
      { url: Paths.userList, name: 'Users' },
      {
        url: formatPath(Paths.userDetail, { userID: user.id }),
        name: user.username,
      },
      { name: 'Edit' },
    ];

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
