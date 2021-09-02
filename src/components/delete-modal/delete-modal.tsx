import { t } from '@lingui/macro';
import * as React from 'react';
import { Button, Modal, Spinner } from '@patternfly/react-core';

interface IProps {
  cancelAction: () => void;
  children?: any;
  deleteAction: () => void;
  isDisabled?: boolean;
  title: string;
  spinner?: boolean;
}

export class DeleteModal extends React.Component<IProps> {
  render() {
    const { cancelAction, children, deleteAction, isDisabled, title, spinner } =
      this.props;

    return (
      <Modal
        actions={[
          <Button
            key='delete'
            onClick={deleteAction}
            variant='danger'
            isDisabled={isDisabled}
          >
            {t`Delete`}
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
