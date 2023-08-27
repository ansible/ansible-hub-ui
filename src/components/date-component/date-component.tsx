import * as moment from 'moment';
import * as React from 'react';
import { Tooltip } from 'src/components';

export const DateComponent = ({ date }: { date: string }) =>
  date && (
    <time dateTime={date}>
      <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
        {moment(date).fromNow()}
      </Tooltip>
    </time>
  );
