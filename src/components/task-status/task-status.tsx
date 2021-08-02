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
}

export class TaskStatus extends React.Component<IProps, {}> {
  render() {
    const { state } = this.props;
    switch (state) {
      case 'completed':
        return (
          <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
            {state}
          </Label>
        );
      case 'failed':
        return (
          <Label variant='outline' color='red' icon={<ExclamationCircleIcon />}>
            {state}
          </Label>
        );
      case 'running':
        return (
          <Label variant='outline' color='blue' icon={<SyncAltIcon />}>
            {state}
          </Label>
        );
      case 'waiting':
        return (
          <Label variant='outline' color='grey' icon={<OutlinedClockIcon />}>
            {state}
          </Label>
        );
      default:
        return <Label variant='outline'>{state}</Label>;
    }
  }
}
