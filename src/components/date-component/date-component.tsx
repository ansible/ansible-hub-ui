import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import * as moment from 'moment';

interface IProps {
  date: string;
  isRow?: boolean;
}

export class DateComponent extends React.Component<IProps> {
  render() {
    const { date, isRow } = this.props;
    return (
      <Tooltip content={moment(date).format('MMMM Do YYYY')}>
        {isRow ? (
          <td>{moment(date).fromNow()}</td>
        ) : (
          <div>{moment(date).fromNow()}</div>
        )}
      </Tooltip>
    );
  }
}
