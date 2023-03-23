import { Trans, t } from '@lingui/macro';
import { Text } from '@patternfly/react-core';
import React, { useState } from 'react';
import { DeleteModal } from 'src/components';

interface IProps {
  closeAction: () => void;
  deleteAction: () => void;
  name: string;
}

export const DeleteAnsibleRemoteModal = ({
  closeAction,
  deleteAction,
  name,
}: IProps) => {
  const [pending, setPending] = useState(false);

  if (!name) {
    return null;
  }

  return (
    <DeleteModal
      spinner={pending}
      cancelAction={() => {
        setPending(false);
        closeAction();
      }}
      deleteAction={() => {
        setPending(false);
        deleteAction();
      }}
      isDisabled={pending}
      title={t`Delete remote?`}
    >
      <Text>
        <Trans>
          Are you sure you want to delete the remote <b>{name}</b>?<br />
          <b>Note:</b> This will also delete all associated resources under this
          remote.
        </Trans>
      </Text>
    </DeleteModal>
  );
};
