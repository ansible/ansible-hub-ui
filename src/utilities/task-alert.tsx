import { Trans } from '@lingui/macro';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from './parse-pulp-id';

type VariantType = 'default' | 'success' | 'danger' | 'warning' | 'info';

const MaybeLink = ({ to, children }: { to: string; children: ReactNode }) =>
  to ? <Link to={to}>{children}</Link> : <>{children}</>;

// task can be { task: (pulp_href) } or "(pulp_href)" or "(uuid)"
export const taskAlert = (task, title, variant: VariantType = 'info') => ({
  title,
  variant,
  description: (
    <span>
      <Trans>
        See the task management{' '}
        <MaybeLink
          to={formatPath(Paths.taskDetail, {
            task: parsePulpIDFromURL(task?.task || task),
          })}
        >
          detail page{' '}
        </MaybeLink>
        for the status of this task.
      </Trans>
    </span>
  ),
});
