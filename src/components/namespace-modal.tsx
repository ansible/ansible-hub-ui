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
import { NamespaceAPI } from 'src/api';
import { FormFieldHelper, HelpButton } from 'src/components';
import { type ErrorMessagesType } from 'src/utilities';

interface IProps {
  isOpen: boolean;
  onCreateSuccess: (result) => void;
  toggleModal: () => void;
}

export const NamespaceModal = ({
  isOpen,
  onCreateSuccess,
  toggleModal,
}: IProps) => {
  const [name, setName] = useState<string>('');
  const [nameValid, setNameValid] = useState<boolean>(true);
  const [errorMessages, setErrorMessages] = useState<ErrorMessagesType>({});

  function nameIsValid(name) {
    if (name == '') {
      errorMessages['name'] = t`Please, provide the namespace name`;
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      errorMessages['name'] = t`Name can only contain letters and numbers`;
    } else if (name.length <= 2) {
      errorMessages['name'] = t`Name must be longer than 2 characters`;
    } else if (name.startsWith('_')) {
      errorMessages['name'] = t`Name cannot begin with '_'`;
    } else {
      delete errorMessages['name'];
    }

    setNameValid(!('name' in errorMessages));
    setErrorMessages(errorMessages);
  }

  function handleSubmit() {
    const data = {
      name: name,
      groups: [],
    };

    NamespaceAPI.create(data)
      .then(() => {
        toggleModal();
        setName('');
        setErrorMessages({});
        onCreateSuccess(data);
      })
      .catch((error) => {
        const nofield = [];

        for (const e of error.response.data.errors) {
          if (e.source) {
            errorMessages[e.source.parameter] = e.detail;
          } else {
            nofield.push(e.detail || e.title);
          }
        }

        if (nofield.length) {
          errorMessages.__nofield = nofield.join('\n');
        }

        setNameValid(!('name' in errorMessages));
        setErrorMessages(errorMessages);
      });
  }

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t`Create a new namespace`}
      isOpen={isOpen}
      onClose={toggleModal}
      actions={[
        <Button
          key='confirm'
          variant='primary'
          onClick={handleSubmit}
          isDisabled={!name || !nameValid}
        >
          {t`Create`}
        </Button>,
        <Button key='cancel' variant='link' onClick={toggleModal}>
          {t`Cancel`}
        </Button>,
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FormGroup
          label={t`Name`}
          isRequired
          fieldId='name'
          labelIcon={
            <HelpButton
              content={t`Namespace names are limited to alphanumeric characters and underscores, must have a minimum length of 2 characters and cannot start with an ‘_’.`}
              header={t`Namespace name`}
            />
          }
        >
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                validated={nameValid ? 'default' : 'error'}
                isRequired
                type='text'
                id='name'
                name='name'
                value={name}
                onChange={(_event, value) => {
                  setName(value);
                  nameIsValid(value);
                }}
              />
            </InputGroupItem>
          </InputGroup>
          <FormFieldHelper variant={nameValid ? 'default' : 'error'}>
            {errorMessages['name']}
          </FormFieldHelper>
        </FormGroup>
      </Form>
    </Modal>
  );
};
