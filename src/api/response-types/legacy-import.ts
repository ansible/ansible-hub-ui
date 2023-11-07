export class LegacyRoleImportDetailType {
  id: number;
  pulp_id: string;
  role_id: number;
  state: string;
  error: {
    code: string;
    description: string;
    traceback: string;
  };
  summary_fields: {
    request_username: string;
    github_user: string;
    github_repo: string;
    github_reference: string;
    alternate_role_name: string;
    task_messages: {
        id: string;
        state: string;
        message_type: string;
        message_text: string;
    }[];
  };
}
