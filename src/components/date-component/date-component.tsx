import * as React from 'react';
import { Tooltip } from 'src/components';
import * as moment from 'moment';

interface IProps {
  date: string;
}

export class DateComponent extends React.Component<IProps> {
  render() {
    const { date } = this.props;

    moment.locale(navigator.language);

    return (
      date && (
        <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
          {moment(date).fromNow()}
        </Tooltip>
      )
    );
  }
}
