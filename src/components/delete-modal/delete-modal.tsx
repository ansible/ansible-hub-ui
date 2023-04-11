import { t } from '@lingui/macro';
import { Button, Modal, ModalProps, Spinner } from '@patternfly/react-core';
import * as React from 'react';

export interface IProps {
  cancelAction: () => void;
  children?: React.ReactNode;
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
            {spinner && <Spinner size='sm'></Spinner>}
          </Button>
        </div>,
        <Button key='cancel' onClick={cancelAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen={true}
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
