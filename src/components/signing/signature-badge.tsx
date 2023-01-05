import { t } from '@lingui/macro';
import { Label, LabelProps } from '@patternfly/react-core';
import React, { FC } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

interface Props extends LabelProps {
  signState: 'signed' | 'unsigned';
}

export const SignatureBadge: FC<Props> = ({
  signState = 'unsigned',
  isCompact = false,
  ...props
}) => {
  const text = () => {
    switch (signState) {
      case 'signed':
        return t`Signed`;
      case 'unsigned':
        return t`Unsigned`;
    }
  };

  return (
    <Label
      data-cy='signature-badge'
      variant='outline'
      className='hub-signature-badge'
      color={signState === 'signed' ? 'green' : 'orange'}
      icon={
        signState === 'signed' ? (
          <CheckCircleIcon />
        ) : (
          <ExclamationTriangleIcon />
        )
      }
      isCompact={isCompact}
      {...props}
    >
      {text()}
    </Label>
  );
};
