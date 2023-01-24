import { Trans, t } from '@lingui/macro';
import { Checkbox, Text } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ExecutionEnvironmentAPI } from 'src/api';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';
import { waitForTask } from 'src/utilities';
import { errorMessage } from 'src/utilities';

interface IProps {
  closeAction: () => void;
  selectedItem: string;
  addAlert: (message, variant, description?) => void;
  afterDelete: () => void;
}

export const DeleteExecutionEnvironmentModal = (props: IProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeletionPending, setIsDeletionPending] = useState(false);

  const { selectedItem, closeAction } = props;

  return (
    <DeleteModal
      spinner={isDeletionPending}
      title={t`Delete container?`}
      cancelAction={() => closeAction()}
      deleteAction={() =>
        deleteContainer(
          selectedItem,
          props,
          setConfirmDelete,
          setIsDeletionPending,
        )
      }
      isDisabled={!confirmDelete || isDeletionPending}
    >
      <Text className='delete-container-modal-message'>
        <Trans>
          Deleting <b>{selectedItem}</b> and its data will be lost.
        </Trans>
      </Text>
      <Checkbox
        isChecked={confirmDelete}
        onChange={(value) => setConfirmDelete(value)}
        label={t`I understand that this action cannot be undone.`}
        id='delete_confirm'
      />
    </DeleteModal>
  );
};

function deleteContainer(
  selectedItem: string,
  props,
  setConfirmDelete,
  setIsDeletionPending,
) {
  const { addAlert, closeAction, afterDelete } = props;

  setIsDeletionPending(true);

  ExecutionEnvironmentAPI.deleteExecutionEnvironment(selectedItem)
    .then((result) => {
      const taskId = result.data.task.split('tasks/')[1].replace('/', '');
      waitForTask(taskId).then(() => {
        setConfirmDelete(false);
        setIsDeletionPending(false);
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
      setConfirmDelete(false);
      setIsDeletionPending(false);
      addAlert(
        t`Execution environment "${selectedItem}" could not be deleted.`,
        'danger',
        errorMessage(status, statusText),
      );
      closeAction();
    });
}
