import { t } from '@lingui/macro';
import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';

import { Button } from '@patternfly/react-core';

import {
  AlertList,
  AlertType,
  DeleteUserModal,
  EmptyStateUnauthorized,
  LoadingPageWithHeader,
  UserFormPage,
  closeAlertMixin,
} from 'src/components';
import { UserType, UserAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { ErrorMessagesType } from 'src/utilities';

interface IState {
  userDetail: UserType;
  errorMessages: ErrorMessagesType;
  showDeleteModal: boolean;
  alerts: AlertType[];
  redirect?: string;
  unauthorised: boolean;
}

class UserDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      userDetail: undefined,
      errorMessages: {},
      alerts: [],
      showDeleteModal: false,
      unauthorised: false,
    };
  }

  componentDidMount() {
    const { hasPermission, user } = this.context;
    const id = this.props.match.params['userID'];
    if (!user || user.is_anonymous || !hasPermission('galaxy.view_user')) {
      this.setState({ unauthorised: true });
    } else {
      UserAPI.get(id)
        .then((result) => this.setState({ userDetail: result.data }))
        .catch(() => this.setState({ redirect: Paths.notFound }));
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const { userDetail, errorMessages, alerts, showDeleteModal, unauthorised } =
      this.state;
    const { user, hasPermission } = this.context;

    if (unauthorised) {
      return <EmptyStateUnauthorized />;
    }
    if (!userDetail) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.userList, name: t`Users` },
      { name: userDetail.username },
    ];
    const title = t`User details`;

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
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
          breadcrumbs={breadcrumbs}
          title={title}
          errorMessages={errorMessages}
          updateUser={(user) => this.setState({ userDetail: user })}
          isReadonly
          extraControls={
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {!!user && hasPermission('galaxy.change_user') ? (
                <div>
                  <Link
                    to={formatPath(Paths.editUser, {
                      userID: userDetail.id,
                    })}
                  >
                    <Button>{t`Edit`}</Button>
                  </Link>
                </div>
              ) : null}
              {!!user && hasPermission('galaxy.delete_user') ? (
                <div style={{ marginLeft: '8px' }}>
                  <Button
                    variant='secondary'
                    onClick={() => this.setState({ showDeleteModal: true })}
                  >
                    {t`Delete`}
                  </Button>
                </div>
              ) : null}
            </div>
          }
        ></UserFormPage>
      </>
    );
  }

  private closeModal = (didDelete) =>
    this.setState(
      {
        showDeleteModal: false,
      },
      () => {
        if (didDelete) {
          this.setState({ redirect: Paths.userList });
        }
      },
    );

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(UserDetail);

UserDetail.contextType = AppContext;
