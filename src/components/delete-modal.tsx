import { t } from '@lingui/core/macro';
import { Button, Modal, type ModalProps } from '@patternfly/react-core';
import React, { type ReactNode } from 'react';
import { Spinner } from 'src/components';

interface IProps {
  cancelAction: () => void;
  children?: ReactNode;
  deleteAction: () => void;
  isDisabled?: boolean;
  isRemove?: boolean;
  title: string;
  spinner?: boolean;
  'data-cy'?: string;
  variant?: ModalProps['variant'];
}

export const DeleteModal = ({
  cancelAction,
  children,
  deleteAction,
  isDisabled,
  isRemove,
  title,
  spinner,
  variant = 'small',
}: IProps) => {
  return (
    <Modal
      actions={[
        <div data-cy='delete-button' key='delete'>
          <Button
            key='delete'
            onClick={deleteAction}
            variant='danger'
            isDisabled={isDisabled}
          >
            {isRemove ? t`Remove` : t`Delete`}
            {spinner && <Spinner size='sm' />}
          </Button>
        </div>,
        <Button key='cancel' onClick={cancelAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen
      onClose={cancelAction}
      title={title}
      titleIconVariant='warning'
      variant={variant}
      data-cy='modal_checkbox'
    >
      {children}
    </Modal>
  );
};
