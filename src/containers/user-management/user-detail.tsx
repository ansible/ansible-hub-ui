import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';

import { Button } from '@patternfly/react-core';

import {
  LoadingPageWithHeader,
  AlertType,
  AlertList,
  closeAlertMixin,
  UserFormPage,
} from '../../components';
import { UserType, UserAPI } from '../../api';
import { Paths, formatPath } from '../../paths';
import { DeleteUserModal } from './delete-user-modal';
import { AppContext } from '../../loaders/app-context';

interface IState {
  userDetail: UserType;
  errorMessages: object;
  showDeleteModal: boolean;
  alerts: AlertType[];
}

class UserDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      userDetail: undefined,
      errorMessages: {},
      alerts: [],
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];
    UserAPI.get(id)
      .then(result => this.setState({ userDetail: result.data }))
      .catch(() => this.props.history.push(Paths.notFound));
  }

  render() {
    const { userDetail, errorMessages, alerts, showDeleteModal } = this.state;

    const { user } = this.context;

    if (!userDetail) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (!!user && !user.model_permissions.view_user) {
      return <Redirect to={Paths.notFound}></Redirect>;
    }

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        <DeleteUserModal
          isOpen={showDeleteModal}
          closeModal={this.closeModal}
          user={userDetail}
          addAlert={(text, variant, description = undefined) =>
            this.setState({
              alerts: alerts.concat([
                { title: text, variant: variant, description: description },
              ]),
            })
          }
        ></DeleteUserModal>
        <UserFormPage
          user={userDetail}
          breadcrumbs={[
            { url: Paths.userList, name: 'Users' },
            { name: userDetail.username },
          ]}
          title='User details'
          errorMessages={errorMessages}
          updateUser={user => this.setState({ userDetail: user })}
          isReadonly
          extraControls={
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {!!user && user.model_permissions.change_user ? (
                <div>
                  <Link
                    to={formatPath(Paths.editUser, {
                      userID: userDetail.id,
                    })}
                  >
                    <Button>Edit</Button>
                  </Link>
                </div>
              ) : null}
              {!!user && user.model_permissions.delete_user ? (
                <div style={{ marginLeft: '8px' }}>
                  <Button
                    variant='secondary'
                    onClick={() => this.setState({ showDeleteModal: true })}
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          }
        ></UserFormPage>
      </>
    );
  }

  private closeModal = didDelete =>
    this.setState(
      {
        showDeleteModal: false,
      },
      () => {
        if (didDelete) {
          this.props.history.push(Paths.userList);
        }
      },
    );

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(UserDetail);

UserDetail.contextType = AppContext;
