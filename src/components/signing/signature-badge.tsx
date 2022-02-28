import { t } from '@lingui/macro';
import { Label, LabelProps } from '@patternfly/react-core';
import React, { FC } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useContext } from 'src/loaders/app-context';

interface Props extends LabelProps {
  signState: 'signed' | 'unsigned' | 'partial';
}

export const SignatureBadge: FC<Props> = ({
  signState = 'unsigned',
  isCompact = false,
  ...props
}) => {
  const signingEnabled =
    useContext()?.featureFlags?.collection_signing === true;

  if (!signingEnabled) {
    return null;
  }

  const text = () => {
    switch (signState) {
      case 'signed':
        return t`Signed`;
      case 'unsigned':
        return t`Unsigned`;
      case 'partial':
        return t`Partially signed`;
    }
  };

  return (
    <Label
      variant='outline'
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
