import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  HelperTextItemProps,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import React, { ReactNode } from 'react';

export function FormFieldHelper({
  variant,
  children,
}: {
  variant: HelperTextItemProps['variant'];
  children?: ReactNode;
}) {
  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem
          variant={variant}
          {...(variant === 'error'
            ? { icon: <ExclamationCircleIcon /> }
            : variant === 'warning'
            ? { icon: <ExclamationTriangleIcon /> }
            : null)}
        >
          {children}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
}
