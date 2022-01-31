import { t } from '@lingui/macro';
import { Label, LabelProps } from '@patternfly/react-core';
import React, { FC } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useContext } from 'src/loaders/app-context';

interface Props extends LabelProps {
  isSigned?: boolean;
}

const SignatureBadge: FC<Props> = ({
  isSigned = false,
  isCompact = false,
  ...props
}) => {
  const signingEnabled =
    useContext()?.featureFlags?.collection_signing === true;

  if (!signingEnabled) {
    return null;
  }

  return (
    <Label
      variant='outline'
      color={isSigned ? 'green' : 'orange'}
      icon={isSigned ? <CheckCircleIcon /> : <ExclamationTriangleIcon />}
      isCompact={isCompact}
      {...props}
    >
      {isSigned ? t`Signed` : t`Unsigned`}
    </Label>
  );
};

export default SignatureBadge;
