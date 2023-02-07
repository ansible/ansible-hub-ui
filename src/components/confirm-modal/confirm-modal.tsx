import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import * as React from 'react';

interface IProps {
  cancelAction: () => void;
  children?: React.ReactNode;
  confirmAction?: () => void;
  isDisabled?: boolean;
  title: string;
  spinner?: boolean;
  confirmButtonTitle?: string;
}

export class ConfirmModal extends React.Component<IProps> {
  render() {
    const {
      cancelAction,
      children,
      confirmAction,
      isDisabled,
      title,
      spinner,
      confirmButtonTitle,
    } = this.props;

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
            {spinner && <Spinner size='sm'></Spinner>}
          </Button>,
          <Button key='cancel' onClick={cancelAction} variant='link'>
            {t`Cancel`}
          </Button>,
        ]}
        isOpen={true}
        onClose={cancelAction}
        title={title}
        titleIconVariant='warning'
        variant='small'
      >
        {children}
      </Modal>
    );
  }
}
