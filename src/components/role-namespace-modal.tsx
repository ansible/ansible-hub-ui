import { t } from '@lingui/core/macro';
import {
  Button,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { useState } from 'react';
import { LegacyNamespaceAPI } from 'src/api';
import { handleHttpError } from 'src/utilities';

interface IProps {
  addAlert: (alert) => void;
  onClose: () => void;
  onSaved: () => void;
}

export function RoleNamespaceModal({ addAlert, onClose, onSaved }: IProps) {
  const [name, setName] = useState<string>('');

  const onSave = () =>
    LegacyNamespaceAPI.create({ name })
      .then(() => {
        addAlert({
          title: t`Successfully created role namespace ${name}`,
          variant: 'success',
        });
        onSaved();
      })
      .catch(
        handleHttpError(t`Failed to create role namespace`, onClose, addAlert),
      );

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t`Create a role namespace`}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key='create'
          variant='primary'
          onClick={onSave}
          isDisabled={!name}
        >
          {t`Create`}
        </Button>,
        <Button key='cancel' variant='link' onClick={onClose}>
          {t`Cancel`}
        </Button>,
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <FormGroup label={t`Name`} isRequired fieldId='name'>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                isRequired
                type='text'
                id='name'
                name='name'
                value={name}
                onChange={(_event, val) => setName(val)}
              />
            </InputGroupItem>
          </InputGroup>
        </FormGroup>
      </Form>
    </Modal>
  );
}
