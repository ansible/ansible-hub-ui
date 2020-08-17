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
import { UserType, UserAPI, ActiveUserAPI, MeType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { DeleteUserModal } from './delete-user-modal';
import { AppContext } from '../../loaders/standalone/app-context';
import { NamespaceList } from '../namespace-list/namespace-list';

interface IState {
  user: UserType;
  errorMessages: object;
  showDeleteModal: boolean;
  alerts: AlertType[];
}

class UserDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      user: undefined,
      errorMessages: {},
      alerts: [],
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    const id = this.props.match.params['userID'];
    UserAPI.get(id)
      .then(result => this.setState({ user: result.data }))
      .catch(() => this.props.history.push(Paths.notFound));
  }

  render() {
    const { user, errorMessages, alerts, showDeleteModal } = this.state;

    const { activeUser } = this.context;

    if (!user) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (!!activeUser && !activeUser.model_permissions.view_user) {
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
          user={user}
          addAlert={(text, variant) =>
            this.setState({
              alerts: alerts.concat([{ title: text, variant: variant }]),
            })
          }
        ></DeleteUserModal>
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
              {!!activeUser && activeUser.model_permissions.change_user ? (
                <div>
                  <Link
                    to={formatPath(Paths.editUser, {
                      userID: user.id,
                    })}
                  >
                    <Button>Edit</Button>
                  </Link>
                </div>
              ) : null}
              {!!activeUser && activeUser.model_permissions.delete_user ? (
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
