import { t } from '@lingui/macro';
import { Label, type LabelProps } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import React, { type FunctionComponent } from 'react';

interface IProps extends LabelProps {
  signState: 'signed' | 'unsigned';
}

export const SignatureBadge: FunctionComponent<IProps> = ({
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
