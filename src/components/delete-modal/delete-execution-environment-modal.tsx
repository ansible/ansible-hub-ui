import { Trans, t } from '@lingui/macro';
import { Checkbox, Text } from '@patternfly/react-core';
import * as React from 'react';
import { ExecutionEnvironmentAPI } from 'src/api';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';
import { waitForTask } from 'src/utilities';
import { errorMessage } from 'src/utilities';

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
        title={t`Delete container?`}
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
            addAlert(
              <Trans>
                Execution environment &quot;{selectedItem}&quot; has been
                successfully deleted.
              </Trans>,
              'success',
            );
            afterDelete();
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            confirmDelete: false,
            isDeletionPending: false,
          });
          addAlert(
            t`Execution environment "${selectedItem}" could not be deleted.`,
            'danger',
            errorMessage(status, statusText),
          );
          closeAction();
        }),
    );
  }
}
