import * as React from 'react';
import { Button, FormGroup, Modal, TextInput } from '@patternfly/react-core';

interface IProps {
  onCancel?: () => void;
  onSave?: (string) => void;
  group?: any;
}

interface IState {
  name: string;
}

export class GroupModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      name:
        !this.props.group || !this.props.group.name
          ? ''
          : this.props.group.name,
    };
  }
  render() {
    const { onCancel, onSave } = this.props;
    return (
      <Modal
        variant='small'
        onClose={() => onCancel()}
        isOpen={true}
        title={''}
        header={<h2>Create a group</h2>}
        aria-label='group-modal'
        actions={[
          <Button
            isDisabled={
              this.state.name.length === 0 ||
              (this.props.group && this.state.name === this.props.group.name)
            }
            key='create'
            variant='primary'
            onClick={() => onSave(this.state.name)}
          >
            {!this.props.group ? 'Create' : 'Save'}
          </Button>,
          <Button key='cancel' variant='link' onClick={() => onCancel()}>
            Cancel
          </Button>,
        ]}
      >
        <FormGroup isRequired={true} key='name' fieldId='name' label='Name'>
          <TextInput
            id='group_name'
            value={this.state.name}
            onChange={value => this.setState({ name: value })}
            type='text'
          />
        </FormGroup>
      </Modal>
    );
  }
}
