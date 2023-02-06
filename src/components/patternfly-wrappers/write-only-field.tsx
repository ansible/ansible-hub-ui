import { t } from '@lingui/macro';
import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import React from 'react';

interface IProps {
  /** Specify if the value is set on the backend already */
  isValueSet: boolean;

  /** Function to set the value to null */
  onClear: () => void;

  /** Component to display when the user is allowed to update this field. */
  children: React.ReactNode;
}

export const WriteOnlyField = ({ onClear, isValueSet, children }: IProps) =>
  !isValueSet ? (
    <>{children}</>
  ) : (
    <InputGroup>
      <TextInput
        aria-label={t`hidden value`}
        placeholder='••••••••••••••••••••••'
        type='password'
        isDisabled={isValueSet}
      />
      {isValueSet && (
        <Button onClick={() => onClear()} variant='control'>
          {t`Clear`}
        </Button>
      )}
    </InputGroup>
  );
