import { t } from '@lingui/macro';
import * as React from 'react';
import { Button, Modal, ModalProps, Spinner } from '@patternfly/react-core';

export interface IProps {
  cancelAction: () => void;
  children?: React.ReactNode;
  deleteAction: () => void;
  isDisabled?: boolean;
  title: string;
  spinner?: boolean;
  'data-cy'?: string;
  variant?: ModalProps['variant'];
}

export class DeleteModal extends React.Component<IProps> {
  static defaultProps = {
    variant: 'small',
  };

  render() {
    const {
      cancelAction,
      children,
      deleteAction,
      isDisabled,
      title,
      spinner,
      variant,
    } = this.props;

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
              {t`Delete`}
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
  }
}
