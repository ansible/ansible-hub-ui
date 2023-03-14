import { Trans } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import { Paths, formatPath } from 'src/paths';

type VariantType = 'default' | 'success' | 'danger' | 'warning' | 'info';

export const taskAlert = (task, title, variant: VariantType = 'info') => ({
  title,
  variant,
  description: (
    <span>
      <Trans>
        See the task management{' '}
        <Link to={formatPath(Paths.taskDetail, { task })}>detail page </Link>
        for the status of this task.
      </Trans>
    </span>
  ),
});
