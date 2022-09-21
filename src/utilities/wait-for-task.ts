import { t } from '@lingui/macro';
import { TaskAPI } from 'src/api';
import { parsePulpIDFromURL } from './parse-pulp-id';

interface Options {
  bailAfter?: number;
  waitMs?: number;
}

export function waitForTask(task, options: Options = {}) {
  // default to 5s wait with max 10 attempts
  const { waitMs = 5000, bailAfter = 10 } = options;

  return TaskAPI.get(task).then((result) => {
    const failing = ['skipped', 'failed', 'canceled'];

    if (failing.includes(result.data.state)) {
      return Promise.reject(
        result.data.error?.description ?? t`Task failed without error message.`,
      );
    }

    if (result.data.state !== 'completed') {
      if (!bailAfter) {
        return Promise.reject(
          new Error(t`Giving up waiting for task after 10 attempts.`),
        );
      }

      return new Promise((r) => setTimeout(r, waitMs)).then(() =>
        waitForTask(task, { ...options, bailAfter: bailAfter - 1 }),
      );
    }
  });
}

export function waitForTaskUrl(taskUrl, options = {}) {
  return waitForTask(parsePulpIDFromURL(taskUrl), options);
}
