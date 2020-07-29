import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { LoadingPageWithHeader, UserFormPage } from '../../components';
import { mapErrorMessages } from '../../utilities';
import { UserType, UserAPI } from '../../api';
import { Paths, formatPath } from '../../paths';

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
  private saveUser = passwordsMatch => {
    if (!passwordsMatch) {
      this.setState({
        errorMessages: { 'password-confirm': 'Passwords do not match' },
      });
      return;
    }
    const { user } = this.state;
    UserAPI.update(user.id.toString(), user)
      .then(result => this.props.history.push(Paths.userList))
      .catch(err => {
        this.setState({ errorMessages: mapErrorMessages(err) });
      });
  };
}

export default withRouter(UserEdit);
