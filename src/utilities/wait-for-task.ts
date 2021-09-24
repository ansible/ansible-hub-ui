import { TaskAPI } from 'src/api';

export function waitForTask(task) {
  return TaskAPI.get(task).then((result) => {
    if (result.data.state !== 'completed') {
      return new Promise((r) => setTimeout(r, 5000)).then(() =>
        waitForTask(task),
      );
    }
  });
}
