import * as moment from 'moment';
import React from 'react';
import { Tooltip } from 'src/components';

interface IProps {
  date: string;
}

export class DateComponent extends React.Component<IProps> {
  render() {
    const { date } = this.props;

    return (
      date && (
        <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
          {moment(date).fromNow()}
        </Tooltip>
      )
    );
  }
}
