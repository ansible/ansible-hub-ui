import { t } from '@lingui/core/macro';
import {
  Button,
  InputGroup,
  InputGroupItem,
  TextInput,
} from '@patternfly/react-core';
import React, { type ReactNode } from 'react';

interface IProps {
  /** Specify if the value is set on the backend already */
  isValueSet: boolean;

  /** Function to set the value to null */
  onClear: () => void;

  /** Component to display when the user is allowed to update this field. */
  children: ReactNode;
}

export const WriteOnlyField = ({ onClear, isValueSet, children }: IProps) =>
  !isValueSet ? (
    <>{children}</>
  ) : (
    <InputGroup>
      <InputGroupItem isFill>
        <TextInput
          aria-label={t`hidden value`}
          placeholder='••••••••••••••••••••••'
          type='password'
          autoComplete='off'
          isDisabled={isValueSet}
        />
      </InputGroupItem>
      {isValueSet && (
        <Button onClick={() => onClear()} variant='control'>
          {t`Clear`}
        </Button>
      )}
    </InputGroup>
  );
