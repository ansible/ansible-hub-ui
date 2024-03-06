import {
  Form,
  FormGroup,
  TextInput,
  TextInputTypes,
} from '@patternfly/react-core';
import React, { ReactElement, ReactNode } from 'react';
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
  onSave: () => void;
  requiredFields: string[];
  updateField: (value, event) => void;
}

export const DataForm = ({
  errorMessages,
  formFields,
  formPrefix,
  formSuffix,
  isReadonly,
  model,
  onSave,
  requiredFields,
  updateField,
}: IProps) => {
  const fields = formFields.map((field) => {
    if (!field) {
      return null;
    }

    const validated = field.id in errorMessages ? 'error' : 'default';

    return (
      <FormGroup
        fieldId={field.id}
        isRequired={!isReadonly && requiredFields.includes(field.id)}
        key={field.id}
        label={field.title}
        labelIcon={!isReadonly && field.formGroupLabelIcon}
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
        <FormFieldHelper variant={isReadonly ? 'default' : validated}>
          {errorMessages[field.id]}
        </FormFieldHelper>
      </FormGroup>
    );
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      {formPrefix}
      {fields}
      {formSuffix}
    </Form>
  );
};
