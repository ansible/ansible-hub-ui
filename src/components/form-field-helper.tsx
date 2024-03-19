import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  type HelperTextItemProps,
} from '@patternfly/react-core';
import React, { type ReactNode } from 'react';

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
          variant={variant as HelperTextItemProps['variant']}
          hasIcon={['success', 'error', 'warning'].includes(variant)}
        >
          {children}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
}
