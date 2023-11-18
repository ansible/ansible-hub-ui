import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { LegacyNamespaceListType } from 'src/api';
import { ProviderLink } from 'src/components';
import { getProviderInfo } from 'src/utilities';

interface IProps {
  addAlert: (alert) => void;
  closeAction: () => void;
  namespace: LegacyNamespaceListType;
}

export const RoleNamespaceEditModal = ({
  addAlert,
  closeAction,
  namespace,
}: IProps) => {
  const finishAction = () => {
    closeAction();

    if (addAlert) {
      addAlert({
        title: t`TODO`, // TODO
        variant: 'success',
      });
    }
  };

  const actions = [
    <Button key='submit' onClick={() => finishAction()} variant='primary'>
      {t`Save`}
    </Button>,
    <Button key='close' onClick={() => closeAction()} variant='link'>
      {t`Cancel`}
    </Button>,
  ];

  const provider = getProviderInfo(namespace);

  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={closeAction}
      title={t`Change provider namespace`}
      variant='small'
    >
      Namespace {namespace.name}
      <ProviderLink {...provider} />
      Select...TODO
      <br />
      Delete...TODO
      <br />
      Submit...TODO
    </Modal>
  );
};
