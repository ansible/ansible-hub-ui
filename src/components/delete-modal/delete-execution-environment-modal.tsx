import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { ExecutionEnvironmentAPI } from 'src/api';
import { waitForTask } from 'src/utilities';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';

import { Checkbox, Text } from '@patternfly/react-core';

interface IState {
  confirmDelete: boolean;
  isDeletionPending: boolean;
}

interface IProps {
  closeAction: () => void;
  selectedItem: string;
  addAlert: (message, variant, description?) => void;
  afterDelete: () => void;
}

export class DeleteExecutionEnvironmentModal extends React.Component<
  IProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      confirmDelete: false,
      isDeletionPending: false,
    };
  }

  render() {
    const { selectedItem, closeAction } = this.props;
    const { isDeletionPending, confirmDelete } = this.state;

    return (
      <DeleteModal
        spinner={isDeletionPending}
        title={'Delete container?'}
        cancelAction={() => closeAction()}
        deleteAction={() => this.deleteContainer(selectedItem)}
        isDisabled={!confirmDelete || isDeletionPending}
      >
        <Text className='delete-container-modal-message'>
          <Trans>
            Deleting <b>{selectedItem}</b> and its data will be lost.
          </Trans>
        </Text>
        <Checkbox
          isChecked={confirmDelete}
          onChange={(value) => this.setState({ confirmDelete: value })}
          label={t`I understand that this action cannot be undone.`}
          id='delete_confirm'
        />
      </DeleteModal>
    );
  }

  deleteContainer(selectedItem: string) {
    const { addAlert, closeAction, afterDelete } = this.props;
    this.setState({ isDeletionPending: true }, () =>
      ExecutionEnvironmentAPI.deleteExecutionEnvironment(selectedItem)
        .then((result) => {
          const taskId = result.data.task.split('tasks/')[1].replace('/', '');
          waitForTask(taskId).then(() => {
            this.setState({
              confirmDelete: false,
              isDeletionPending: false,
            });
            closeAction();
            addAlert(t`Success: ${selectedItem} was deleted`, 'success', null);
            afterDelete();
          });
        })
        .catch(() => {
          this.setState({
            confirmDelete: false,
            isDeletionPending: false,
          });
          addAlert(t`Error: delete failed`, 'danger', null);
          closeAction();
        }),
    );
  }
}
