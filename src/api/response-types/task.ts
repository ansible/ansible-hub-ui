import { PulpStatus } from 'src/api';

export class TaskType {
  pulp_created: string;
  state: PulpStatus;
  name: string;
  started_at: string;
  finished_at: string;
  error: { traceback: string; description: string };
  pulp_href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress_reports: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task_group: any;
  parent_task: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child_tasks: any[];
  reserved_resources_record: string[];
}
