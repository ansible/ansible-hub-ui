import { PulpStatus } from 'src/api';

export class TaskType {
  pulp_created: string;
  state: PulpStatus;
  name: string;
  started_at: string;
  finished_at: string;
  error: { traceback: string; description: string };
  pulp_href: string;
  progress_reports: any[];
  task_group: any;
  parent_task: string;
  child_tasks: any[];
  reserved_resources_record: string[];
}
