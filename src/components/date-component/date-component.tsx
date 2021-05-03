import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import * as moment from 'moment';

interface IProps {
  date: string;
}

export class DateComponent extends React.Component<IProps> {
  render() {
    const { date } = this.props;
    console.log(date);
    return (
      <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
        <div>{moment(date).fromNow()}</div>
      </Tooltip>
    );
  }
}
