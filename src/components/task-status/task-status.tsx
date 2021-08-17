import * as React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';
import { Label } from '@patternfly/react-core';

interface IProps {
  state: string;
  className?: string;
}

export class TaskStatus extends React.Component<IProps, {}> {
  render() {
    const { state, className } = this.props;
    switch (state) {
      case 'completed':
        return (
          <Label
            variant='outline'
            className={className}
            color='green'
            icon={<CheckCircleIcon />}
          >
            {_`Completed`}
          </Label>
        );
      case 'failed':
        return (
          <Label
            variant='outline'
            className={className}
            color='red'
            icon={<ExclamationCircleIcon />}
          >
            {_`Failed`}
          </Label>
        );
      case 'running':
        return (
          <Label
            variant='outline'
            className={className}
            color='blue'
            icon={<SyncAltIcon />}
          >
            {_`Running`}
          </Label>
        );
      case 'waiting':
        return (
          <Label
            variant='outline'
            className={className}
            color='grey'
            icon={<OutlinedClockIcon />}
          >
            {_`Waiting`}
          </Label>
        );
      case 'canceled':
        return (
          <Label
            variant='outline'
            className={className}
            color='orange'
            icon={<ExclamationCircleIcon />}
          >
            {_`Canceled`}
          </Label>
        );
      default:
        return (
          <Label variant='outline' className={className}>
            {state}
          </Label>
        );
    }
  }
}
