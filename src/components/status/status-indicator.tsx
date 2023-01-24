import { t } from '@lingui/macro';
import { Label, LabelProps } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  OutlinedClockIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import React from 'react';
import { PulpStatus } from 'src/api';

interface IProps {
  status: PulpStatus;
  type?: 'primary' | 'secondary';
  className?: string;
}

interface LabelPropType {
  color: LabelProps['color'];
  icon: React.ReactElement;
  text: string;
}

const typeToVariantMap: Record<string, LabelProps['variant']> = {
  primary: 'outline',
  secondary: 'filled',
};

const statusToProps = (status): LabelPropType => {
  switch (status) {
    case PulpStatus.waiting:
      return {
        color: 'blue',
        text: t`Pending`,
        icon: <OutlinedClockIcon />,
      };

    // TODO: what does skipped mean in pulp
    case PulpStatus.skipped:
    case PulpStatus.canceled:
      return {
        color: 'orange',
        text: t`Canceled`,
        icon: <ExclamationIcon />,
      };

    case PulpStatus.running:
      return { color: 'blue', text: t`Running`, icon: <SyncAltIcon /> };

    case PulpStatus.completed:
      return {
        color: 'green',
        text: t`Completed`,
        icon: <CheckCircleIcon />,
      };

    case PulpStatus.failed:
      return {
        color: 'red',
        text: t`Failed`,
        icon: <ExclamationCircleIcon />,
      };
  }
  return null;
};

export const StatusIndicator = ({
  status,
  type = 'primary',
  className,
}: IProps) => {
  const labelProps = statusToProps(status);
  if (!labelProps) {
    return <>---</>;
  }

  return (
    <Label
      variant={typeToVariantMap[type]}
      color={labelProps.color}
      icon={labelProps.icon}
      className={className}
    >
      {labelProps.text}
    </Label>
  );
};
