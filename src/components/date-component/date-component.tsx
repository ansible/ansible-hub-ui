import * as React from 'react';
import { Tooltip } from 'src/components';
import * as moment from 'moment';

interface IProps {
  date: string;
}

export class DateComponent extends React.Component<IProps> {
  render() {
    const { date } = this.props;
    return (
      <Tooltip content={moment(date).format(_`DD MMMM YYYY, HH:mm Z`)}>
        {moment(date).fromNow()}
      </Tooltip>
    );
  }
}
