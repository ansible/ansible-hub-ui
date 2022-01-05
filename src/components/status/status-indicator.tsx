import { t } from '@lingui/macro';
import * as React from 'react';

import { Label } from '@patternfly/react-core';
import {
  OutlinedClockIcon,
  ExclamationIcon,
  SyncAltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

import { PulpStatus } from 'src/api';

interface IProps {
  status: PulpStatus;
  type?: 'primary' | 'secondary';
  className?: string;
}

interface LabelPropType {
  color: string;
  icon: React.ReactElement;
  text: string;
}

export class StatusIndicator extends React.Component<IProps> {
  static defaultProps = {
    type: 'primary',
  };

  typeToVariantMap = {
    primary: 'outline',
    secondary: 'filled',
  };

  render() {
    let labelProps: LabelPropType;
    const { status, type } = this.props;

    switch (status) {
      case PulpStatus.waiting:
        labelProps = {
          color: 'blue',
          text: t`Pending`,
          icon: <OutlinedClockIcon />,
        };
        break;

      // TODO: what does skipped mean in pulp
      case PulpStatus.skipped:
      case PulpStatus.canceled:
        labelProps = {
          color: 'orange',
          text: t`Canceled`,
          icon: <ExclamationIcon />,
        };
        break;

      case PulpStatus.running:
        labelProps = { color: 'blue', text: t`Running`, icon: <SyncAltIcon /> };
        break;

      case PulpStatus.completed:
        labelProps = {
          color: 'green',
          text: t`Completed`,
          icon: <CheckCircleIcon />,
        };
        break;

      case PulpStatus.failed:
        labelProps = {
          color: 'red',
          text: t`Failed`,
          icon: <ExclamationCircleIcon />,
        };
        break;
      default:
        return '---';
    }

    return (
      <Label
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variant={this.typeToVariantMap[type] as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color={labelProps.color as any}
        icon={labelProps.icon}
        className={this.props.className}
      >
        {labelProps.text}
      </Label>
    );
  }
}
