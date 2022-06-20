import { t } from '@lingui/macro';
import { TaskAPI } from 'src/api';

export function waitForTask(task, bailAfter = 10) {
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

      return new Promise((r) => setTimeout(r, 5000)).then(() =>
        waitForTask(task, bailAfter - 1),
      );
    }
  });
}
