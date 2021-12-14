import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { ExecutionEnvironmentAPI } from 'src/api';
import { waitForTask } from 'src/utilities';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';

import { Checkbox } from '@patternfly/react-core';

interface IState {
  confirmDelete: boolean;
  isDeletionPending: boolean;
}

interface IProps {
  closeAction: Function;
  selectedItem: string;
  addAlert: (message, variant, description?) => void;
  afterDelete: Function;
}

export class DeleteExecutionEnviromentModal extends React.Component<
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
        title={'Permanently delete container?'}
        cancelAction={() => closeAction()}
        deleteAction={() => this.deleteContainer(selectedItem)}
        isDisabled={!confirmDelete || isDeletionPending}
      >
        <Trans>
          Deleting <b>{selectedItem}</b> and its data will be lost.
        </Trans>
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
