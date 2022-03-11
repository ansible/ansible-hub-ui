export function getIdFromTask(task: string) {
  return task.match(/tasks\/([a-zA-Z0-9-]+)/i)[1];
}
