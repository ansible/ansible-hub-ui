import { DateTime } from 'luxon';
import React from 'react';
import { Tooltip } from 'src/components';
import { language as locale } from 'src/l10n';

const dateFormat = (date) =>
  DateTime.fromISO(date, { locale }).toFormat('d MMMM y, HH:mm z');
const relativeFormat = (date) =>
  DateTime.fromISO(date, { locale }).toRelative();

export const DateComponent = ({ date }: { date: string }) =>
  date && (
    <time dateTime={date}>
      <Tooltip content={dateFormat(date)}>{relativeFormat(date)}</Tooltip>
    </time>
  );
