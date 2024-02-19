import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { ReactNode } from 'react';

interface IProps {
  cancelAction: () => void;
  children?: ReactNode;
  confirmAction?: () => void;
  isDisabled?: boolean;
  title: string;
  spinner?: boolean;
  confirmButtonTitle?: string;
}

export const ConfirmModal = (props: IProps) => {
  const {
    cancelAction,
    children,
    confirmAction,
    isDisabled,
    title,
    spinner,
    confirmButtonTitle,
  } = props;

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={confirmAction}
          variant='primary'
          isDisabled={isDisabled}
        >
          {confirmButtonTitle ? confirmButtonTitle : t`Yes`}
          {spinner && <Spinner size='sm' />}
        </Button>,
        <Button key='cancel' onClick={cancelAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen
      onClose={cancelAction}
      title={title}
      titleIconVariant='warning'
      variant='small'
    >
      {children}
    </Modal>
  );
};
