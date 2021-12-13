import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { ExecutionEnvironmentType, ExecutionEnvironmentAPI } from 'src/api';
import { waitForTask } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';

import { Checkbox } from '@patternfly/react-core';

interface IState {
  isWaitingForResponse: boolean;
  confirmDelete: boolean;
  isDeletionPending: boolean;
}

interface IProps {
  cancelAction: Function;
  selectedItem: ExecutionEnvironmentType;
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
      isWaitingForResponse: false,
      confirmDelete: false,
      isDeletionPending: false,
    };
  }

  render() {
    const { selectedItem, cancelAction } = this.props;
    const { isDeletionPending, confirmDelete } = this.state;

    return (
      <DeleteModal
        spinner={isDeletionPending}
        title={'Permanently delete container?'}
        cancelAction={() => cancelAction()}
        deleteAction={() => this.deleteContainer(selectedItem)}
        isDisabled={!confirmDelete || isDeletionPending}
      >
        <Trans>
          Deleting <b>{this.getName(selectedItem)}</b> and its data will be
          lost.
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

  getName(selectedItem: ExecutionEnvironmentType) {
    return !!selectedItem ? selectedItem.name : '';
  }

  deleteContainer(selectedItem: ExecutionEnvironmentType) {
    const { addAlert, cancelAction, afterDelete } = this.props;
    this.setState({ isDeletionPending: true }, () =>
      ExecutionEnvironmentAPI.deleteExecutionEnvironment(selectedItem.name)
        .then((result) => {
          const taskId = result.data.task.split('tasks/')[1].replace('/', '');
          waitForTask(taskId).then(() => {
            this.setState({
              confirmDelete: false,
              isDeletionPending: false,
            });
            cancelAction();
            addAlert(
              t`Success: ${this.getName(selectedItem)} was deleted`,
              'success',
              null,
            );
            afterDelete();
          });
        })
        .catch(() => {
          this.setState({
            confirmDelete: false,
            isDeletionPending: false,
          });
          addAlert(t`Error: delete failed`, 'danger', null);
          cancelAction();
        }),
    );
  }
}
