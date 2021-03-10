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
}

interface LabelPropType {
  color: string;
  icon: any;
  text: string;
}

export class StatusIndicator extends React.Component<IProps, {}> {
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
          text: 'Pending',
          icon: <OutlinedClockIcon />,
        };
        break;

      // TODO: what does skipped mean in pulp
      case PulpStatus.skipped:
      case PulpStatus.canceled:
        labelProps = {
          color: 'orange',
          text: 'Canceled',
          icon: <ExclamationIcon />,
        };
        break;

      case PulpStatus.running:
        labelProps = { color: 'blue', text: 'Running', icon: <SyncAltIcon /> };
        break;

      case PulpStatus.completed:
        labelProps = {
          color: 'green',
          text: 'Completed',
          icon: <CheckCircleIcon />,
        };
        break;

      case PulpStatus.failed:
        labelProps = {
          color: 'red',
          text: 'Failed',
          icon: <ExclamationCircleIcon />,
        };
        break;
      default:
        return '---';
    }

    return (
      <Label
        variant={this.typeToVariantMap[type] as any}
        color={labelProps.color as any}
        icon={labelProps.icon}
      >
        {labelProps.text}
      </Label>
    );
  }
}
