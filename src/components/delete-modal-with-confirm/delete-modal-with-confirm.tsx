import * as React from 'react';
import { t } from '@lingui/macro';

import { Checkbox } from '@patternfly/react-core';

import {
  DeleteModal,
  IProps as DeleteModalProps,
} from '../../components/delete-modal/delete-modal';

interface IProps extends DeleteModalProps {
  isOpen: boolean;
}

interface IState {
  confirmDelete: boolean;
}

export class DeleteModalWithConfirm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      confirmDelete: false,
    };
  }

  render() {
    const { isOpen, cancelAction, deleteAction, title, children } = this.props;

    if (!isOpen) return null;

    return (
      <DeleteModal
        isDisabled={!this.state.confirmDelete}
        cancelAction={() => {
          this.setState({ confirmDelete: false });
          cancelAction();
        }}
        deleteAction={() => {
          this.setState({ confirmDelete: false });
          deleteAction();
        }}
        title={title}
      >
        {children}
        <Checkbox
          isChecked={this.state.confirmDelete}
          onChange={(val) => this.setState({ confirmDelete: val })}
          label={t`I understand that this action cannot be undone.`}
          id='delete_confirm'
        />
      </DeleteModal>
    );
  }
}
