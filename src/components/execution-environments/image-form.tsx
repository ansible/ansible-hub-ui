import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  TextInput,
} from '@patternfly/react-core';

interface IProps {
  onSave: () => void;
  onCancel: () => void;
  onChange: () => void;
}

export class ImageForm extends React.Component<IProps> {
  render() {
    const { onSave, onCancel, onChange } = this.props;
    return (
      <Modal
        variant='small'
        onClose={onCancel}
        isOpen={true}
        title={'Edit image'}
        actions={[
          <Button key='save' variant='primary' onClick={onSave}>
            Save
          </Button>,
          <Button key='cancel' variant='link' onClick={onCancel}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup
            isRequired={true}
            key='username'
            fieldId='username'
            label='Username'
          >
            <TextInput
              id='username'
              value={'pppp'}
              onChange={onChange}
              type='text'
            />
          </FormGroup>
          <FormGroup
            isRequired={true}
            key='password'
            fieldId='password'
            label='Password'
          >
            <TextInput
              id='poassword'
              value={'ppppp'}
              onChange={onChange}
              type='password'
            />
          </FormGroup>
          <FormGroup
            isRequired={true}
            key='proxy_url'
            fieldId='proxy_url'
            label='Proxy URL'
          >
            <TextInput
              id='proxy_url'
              value={'ppppp'}
              onChange={onChange}
              type='text'
            />
          </FormGroup>
          <FormGroup
            isRequired={true}
            key='proxy_port'
            fieldId='proxy_port'
            label='Proxy port'
          >
            <TextInput
              id='proxy_port'
              value={'ppppp'}
              onChange={onChange}
              type='text'
            />
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
