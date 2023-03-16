import { Trans } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from 'src/utilities';

type VariantType = 'default' | 'success' | 'danger' | 'warning' | 'info';

// task can be { task: (pulp_href) } or "(pulp_href)" or "(uuid)"
export const taskAlert = (task, title, variant: VariantType = 'info') => ({
  title,
  variant,
  description: (
    <span>
      <Trans>
        See the task management{' '}
        <Link
          to={formatPath(Paths.taskDetail, {
            task: parsePulpIDFromURL(task?.task || task),
          })}
        >
          detail page{' '}
        </Link>
        for the status of this task.
      </Trans>
    </span>
  ),
});
