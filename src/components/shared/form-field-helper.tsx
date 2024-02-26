import {
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import React, { ReactNode } from 'react';

export function FormFieldHelper({
  variant = 'default',
  children = null,
}: {
  variant?: string; // default | indeterminate | success | error | warning
  children?: ReactNode;
}) {
  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem
          variant={variant}
          hasIcon={['success', 'error', 'warning'].includes(variant)}
        >
          {children}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
}
