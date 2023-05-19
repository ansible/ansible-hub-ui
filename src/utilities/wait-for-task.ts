import { t } from '@lingui/macro';
import { TaskAPI } from 'src/api';
import { parsePulpIDFromURL } from './parse-pulp-id';

interface Options {
  bailAfter?: number;
  multiplier?: number;
  waitMs?: number;
}

export function waitForTask(task, options: Options = {}) {
  // default to starting with a 2s wait, increasing the wait time 1.5x each time, with max 10 attempts
  // 2000, 1.5, 10 = ~226s ; 500, 1.5, 10 = ~57s
  const { waitMs = 2000, multiplier = 1.5, bailAfter = 10 } = options;

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
        waitForTask(task, {
          ...options,
          waitMs: Math.round(waitMs * multiplier),
          bailAfter: bailAfter - 1,
        }),
      );
    }
  });
}

export function waitForTaskUrl(taskUrl, options = {}) {
  return waitForTask(parsePulpIDFromURL(taskUrl), options);
}
