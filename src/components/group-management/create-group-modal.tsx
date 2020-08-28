import * as React from 'react';
import { Button, FormGroup, Modal, TextInput } from '@patternfly/react-core';

interface IProps {
  onCancel?: () => void;
  onSave?: (string) => void;
}

interface IState {
  name: string;
}

export class CreateGroupModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
    };
  }
  render() {
    const { onCancel, onSave } = this.props;
    return (
      <Modal
        variant='default'
        onClose={() => onCancel()}
        isOpen={true}
        title={''}
        header={<h2>Create a group</h2>}
        actions={[
          <Button
            isDisabled={this.state.name.length === 0}
            key='create'
            variant='primary'
            onClick={() => onSave(this.state.name)}
          >
            Create
          </Button>,
          <Button key='cancel' variant='link' onClick={() => onCancel()}>
            Cancel
          </Button>,
        ]}
      >
        <FormGroup isRequired={true} key='name' fieldId='name' label='Name'>
          <TextInput
            id='group_name'
            onChange={value => this.setState({ name: value })}
            type='text'
          />
        </FormGroup>
      </Modal>
    );
  }
}
