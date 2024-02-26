import {
  Form,
  FormGroup,
  TextInput,
  TextInputTypes,
} from '@patternfly/react-core';
import React, { Component, ReactElement, ReactNode } from 'react';
import { FormFieldHelper } from 'src/components';
import { ErrorMessagesType } from 'src/utilities';

interface IProps {
  errorMessages: ErrorMessagesType;
  formFields: {
    formGroupLabelIcon?: ReactElement;
    id: string;
    placeholder?: string;
    title: string;
    type?: string;
    helper?: ReactNode;
  }[];
  formPrefix?: ReactNode;
  formSuffix?: ReactNode;
  isReadonly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Record<string, any>;
  requiredFields: string[];
  updateField: (value, event) => void;
  onSave: () => void;
}

export class DataForm extends Component<IProps> {
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

    const fields = formFields.map((field) => {
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
          labelIcon={!isReadonly && field.formGroupLabelIcon}
          validated={isReadonly ? 'default' : validated}
          data-cy={`DataForm-field-${field.id}`}
        >
          {isReadonly ? (
            model[field.id]
          ) : (
            <TextInput
              id={field.id}
              onChange={updateField}
              placeholder={field.placeholder}
              type={(field.type as TextInputTypes) || 'text'}
              validated={validated}
              value={model[field.id]}
              {...(field.type === 'password' ? { autoComplete: 'off' } : {})}
            />
          )}
          {field.helper}
        </FormGroup>
      );
    });

    return (
      <Form
        onSubmit={(e) => {
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
