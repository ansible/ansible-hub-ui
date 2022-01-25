import { t } from '@lingui/macro';
import { Label, LabelProps } from '@patternfly/react-core';
import React, { FC } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

interface Props extends LabelProps {
  isSigned?: boolean;
}

const SignatureBadge: FC<Props> = ({
  isSigned = false,
  isCompact = false,
  ...props
}) => (
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

export default SignatureBadge;
