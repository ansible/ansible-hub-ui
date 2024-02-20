import { Tooltip } from '@patternfly/react-core';
import * as moment from 'moment';
import React from 'react';

export const DateComponent = ({ date }: { date: string }) =>
  date && (
    <time dateTime={date}>
      <Tooltip content={moment(date).format('DD MMMM YYYY, HH:mm Z')}>
        {moment(date).fromNow()}
      </Tooltip>
    </time>
  );
