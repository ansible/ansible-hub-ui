import { Trans, t } from '@lingui/macro';
import React, { Component } from 'react';
import { UserAPI, type UserType } from 'src/api';
import { DeleteModal } from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { errorMessage, mapErrorMessages } from 'src/utilities';

interface IState {
  isWaitingForResponse: boolean;
}

interface IProps {
  isOpen: boolean;
  user?: UserType;
  closeModal: (didDelete: boolean) => void;
  addAlert: (message, variant, description?) => void;
}

export class DeleteUserModal extends Component<IProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = { isWaitingForResponse: false };
  }

  render() {
    const { isOpen, user, closeModal } = this.props;
    const { isWaitingForResponse } = this.state;
    if (!user || !isOpen) {
      return null;
    }

    return (
      <DeleteModal
        cancelAction={() => closeModal(false)}
        deleteAction={() => this.deleteUser()}
        isDisabled={isWaitingForResponse || this.isUserSelfOrAdmin(user)}
        spinner={isWaitingForResponse}
        title={t`Delete user?`}
      >
        {this.getActionDescription(user)}
      </DeleteModal>
    );
  }

  private getActionDescription(user: UserType) {
    if (user.is_superuser) {
      return t`Deleting super users is not allowed.`;
    } else if (user.id === (this.context as IAppContextType).user.id) {
      return t`Deleting yourself is not allowed.`;
    }

    return (
      <Trans>
        <b>{user.username}</b> will be permanently deleted.
      </Trans>
    );
  }

  private isUserSelfOrAdmin = (user: UserType): boolean => {
    return (
      user.is_superuser || user.id === (this.context as IAppContextType).user.id
    );
  };

  private deleteUser = () => {
    this.setState({ isWaitingForResponse: true }, () =>
      UserAPI.delete(this.props.user.id)
        .then(() => this.waitForDeleteConfirm(this.props.user.id))
        .catch((err) => {
          this.props.addAlert(
            t`User "${this.props.user.username}" could not be deleted.`,
            'danger',
            mapErrorMessages(err)['__nofield'],
          );
          this.props.closeModal(false);
        })
        .finally(() => this.setState({ isWaitingForResponse: false })),
    );
  };

  // Wait for the user to actually get removed from the database before closing the
  // modal
  private waitForDeleteConfirm(user) {
    UserAPI.get(user)
      .then(async () => {
        // wait half a second
        await new Promise((r) => setTimeout(r, 500));
        this.waitForDeleteConfirm(user);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        if (err.response.status === 404) {
          this.props.addAlert(
            <Trans>
              User &quot;{this.props.user.username}&quot; has been successfully
              deleted.
            </Trans>,
            'success',
          );
          this.props.closeModal(true);
        } else {
          this.props.addAlert(
            t`User "${this.props.user.username}" could not be deleted.`,
            'danger',
            errorMessage(status, statusText),
          );
        }

        this.setState({ isWaitingForResponse: false });
      });
  }
}
