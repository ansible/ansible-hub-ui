import * as React from 'react';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

interface IProps {
  errorMessages: any; // FIXME: { [key: string]: string }, but all callers use {}, object or any
  formFields: {
    formGroupLabelIcon?: React.ReactNode;
    id: string;
    placeholder?: string;
    title: string;
    type?: string;
  }[];
  formPrefix?: React.ReactNode;
  formSuffix?: React.ReactNode;
  isReadonly: boolean;
  model: any;
  requiredFields: string[];
  updateField: (value, event) => void;
  onSave: () => void;
}

export class DataForm extends React.Component<IProps> {
  render() {
    const {
      errorMessages,
      formFields,
      formPrefix,
      formSuffix,
      isReadonly,
      model,
      requiredFields,
      updateField,
    } = this.props;

    const fields = formFields.map(field => {
      if (!field) {
        return null;
      }

      const validated = field.id in errorMessages ? 'error' : 'default';

      return (
        <FormGroup
          fieldId={field.id}
          helperTextInvalid={errorMessages[field.id]}
          isRequired={!isReadonly && requiredFields.includes(field.id)}
          key={field.id}
          label={field.title}
          labelIcon={!isReadonly && (field.formGroupLabelIcon as any)}
          validated={isReadonly ? 'default' : validated}
        >
          {isReadonly ? (
            model[field.id]
          ) : (
            <TextInput
              id={field.id}
              onChange={updateField}
              placeholder={field.placeholder}
              type={(field.type as any) || 'text'}
              validated={validated}
              value={model[field.id]}
            />
          )}
        </FormGroup>
      );
    });

    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
          this.props.onSave();
        }}
      >
        {formPrefix}
        {fields}
        {formSuffix}
      </Form>
    );
  }
}
