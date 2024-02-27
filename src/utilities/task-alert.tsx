import { Trans } from '@lingui/macro';
import React, { ReactNode } from 'react';
import { MaybeLink } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from './parse-pulp-id';

type VariantType = 'custom' | 'success' | 'danger' | 'warning' | 'info';

// task can be { task: (pulp_href) } or "(pulp_href)" or "(uuid)"
export const taskAlert = (
  task,
  title: string | ReactNode,
  variant: VariantType = 'info',
) => ({
  title,
  variant,
  description: (
    <span>
      <Trans>
        See the task management{' '}
        <MaybeLink
          to={
            task
              ? formatPath(Paths.taskDetail, {
                  task: parsePulpIDFromURL(task?.task || task),
                })
              : null
          }
        >
          detail page{' '}
        </MaybeLink>
        for the status of this task.
      </Trans>
    </span>
  ),
});
