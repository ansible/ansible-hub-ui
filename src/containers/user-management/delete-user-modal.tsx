import * as React from 'react';
import { Modal, Button, Spinner } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { UserType, UserAPI } from '../../api';

interface IState {
  isWaitingForResponse: boolean;
}

interface IProps {
  isOpen: boolean;
  user?: UserType;
  closeModal: (didDelete: boolean) => void;
  addAlert: (message, variant) => void;
}

export class DeleteUserModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = { isWaitingForResponse: false };
  }

  render() {
    const { isOpen, user, closeModal } = this.props;
    const { isWaitingForResponse } = this.state;
    if (!user) {
      return null;
    }
    return (
      <Modal
        isSmall
        onClose={() => closeModal(false)}
        isOpen={isOpen}
        title={''}
        header={
          <span className='pf-c-content'>
            <h2>
              <ExclamationTriangleIcon
                size='sm'
                style={{ color: 'var(--pf-global--warning-color--100)' }}
              />{' '}
              Delete user?
            </h2>{' '}
          </span>
        }
        actions={[
          <Button
            isDisabled={isWaitingForResponse}
            key='delete'
            variant='danger'
            onClick={() => this.deleteUser()}
          >
            Delete {isWaitingForResponse && <Spinner size='sm'></Spinner>}
          </Button>,
          <Button key='cancel' variant='link' onClick={() => closeModal(false)}>
            Cancel
          </Button>,
        ]}
      >
        {user.username} will be permanently deleted.
      </Modal>
    );
  }

  private deleteUser = () => {
    this.setState({ isWaitingForResponse: true }, () =>
      UserAPI.delete(this.props.user.id)
        .then(this.waitForDeleteConfirm(this.props.user.id))
        .catch(() => this.props.addAlert('Error deleting user.', 'danger')),
    );
  };

  // Wait for the user to actually get removed from the database before closing the
  // modal
  private waitForDeleteConfirm(user) {
    UserAPI.get(user.id)
      .then(async result => {
        // wait half a second
        await new Promise(r => setTimeout(r, 500));
        this.waitForDeleteConfirm(user);
      })
      .catch(err => {
        if (err.response.status === 404) {
          this.props.addAlert('Successfully deleted user.', 'success');
          this.props.closeModal(true);
        } else {
          this.props.addAlert('Error deleting user.', 'danger');
        }

        this.setState({ isWaitingForResponse: false });
      });
  }
}
