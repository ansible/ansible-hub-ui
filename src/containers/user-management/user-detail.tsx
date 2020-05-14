import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

import { Button } from '@patternfly/react-core';

import { LoadingPageWithHeader } from '../../components';
import { UserFormPage } from './user-form-page';
import { UserType, UserAPI } from '../../api';
import { Paths, formatPath } from '../../paths';

interface IState {
  user: UserType;
  errorMessages: object;
}

class UserDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = { user: undefined, errorMessages: {} };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];
    UserAPI.get(id).then(result => this.setState({ user: result.data }));
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
          { name: user.username },
        ]}
        title='User details'
        errorMessages={errorMessages}
        updateUser={user => this.setState({ user: user })}
        isReadonly
        extraControls={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>
              <Link
                to={formatPath(Paths.editUser, {
                  userID: user.id,
                })}
              >
                <Button>Edit</Button>
              </Link>
            </div>
            <div style={{ marginLeft: '8px' }}>
              <Button variant='secondary'>Delete</Button>
            </div>
          </div>
        }
      ></UserFormPage>
    );
  }
}

export default withRouter(UserDetail);
