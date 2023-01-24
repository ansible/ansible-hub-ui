import * as moment from 'moment';
import * as React from 'react';
import { Tooltip } from 'src/components';

interface IProps {
  date: string;
}

export const DateComponent = (props: IProps) => {
  const { date } = props;

  return (
    date && (
      <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
        {moment(date).fromNow()}
      </Tooltip>
    )
  );
};
