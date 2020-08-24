import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { LoadingPageWithHeader, UserFormPage } from '../../components';
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

    if (
      !this.context.user ||
      !this.context.user.model_permissions ||
      !this.context.user.model_permissions.change_user
    ) {
      return <Redirect to={Paths.notFound}></Redirect>;
    }

    return (
      <UserFormPage
        user={user}
        breadcrumbs={[
          { url: Paths.userList, name: 'Users' },
          {
            url: formatPath(Paths.userDetail, { userID: user.id }),
            name: user.username,
          },
          { name: 'Edit' },
        ]}
        title='Edit user'
        errorMessages={errorMessages}
        updateUser={(user, errorMessages) =>
          this.setState({ user: user, errorMessages: errorMessages })
        }
        saveUser={this.saveUser}
        onCancel={() => this.props.history.push(Paths.userList)}
      ></UserFormPage>
    );
  }
  private saveUser = () => {
    const { user } = this.state;
    UserAPI.update(user.id.toString(), user)
      .then(() => this.props.history.push(Paths.userList))
      .catch(err => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

UserEdit.contextType = AppContext;

export default withRouter(UserEdit);
