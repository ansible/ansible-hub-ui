import { t } from '@lingui/macro';
import { TaskAPI } from 'src/api';

export function waitForTask(task, bailAfter = 10) {
  return TaskAPI.get(task).then((result) => {
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
