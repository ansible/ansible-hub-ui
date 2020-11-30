import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  TextInput,
} from '@patternfly/react-core';

interface IProps {
  onCancel?: () => void;
  onSave?: (string) => void;
  onChange?: () => void;
  group?: any;
  errorMessage?: string;
}

interface IState {
  name: string;
  errorMessage: string;
}

export class GroupModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      name:
        !this.props.group || !this.props.group.name
          ? ''
          : this.props.group.name,
      errorMessage: this.props.errorMessage,
    };
  }
  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>,
    snapshot?: any,
  ): void {
    if (prevState.errorMessage !== this.props.errorMessage) {
      this.setState({ errorMessage: this.props.errorMessage });
    }
  }

  render() {
    const { onCancel, onSave, onChange } = this.props;
    return (
      <Modal
        variant='small'
        onClose={() => {
          onCancel();
        }}
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
        <Form>
          <FormGroup
            isRequired={true}
            key='name'
            fieldId='name'
            label='Name'
            helperTextInvalid={this.state.errorMessage}
            validated={this.toError(!this.state.errorMessage)}
          >
            <TextInput
              id='group_name'
              value={this.state.name}
              onChange={value =>
              {
                this.setState({ name: value});
                onChange();
              }}
              type='text'
              validated={this.toError(!this.state.errorMessage)}
            />
          </FormGroup>
        </Form>
      </Modal>
    );
  }

  private toError(validated: boolean) {
    return validated ? 'default' : 'error';
  }
}
