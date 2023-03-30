export class AnsibleRemoteType {
  auth_url: string;
  ca_cert: string;
  client_cert: string;
  download_concurrency: number;
  name: string;
  proxy_url: string;
  pulp_href?: string;
  rate_limit: number;
  requirements_file: string;
  tls_validation: boolean;
  url: string;
  signed_only: boolean;

  // connect_timeout
  // headers
  // max_retries
  // policy
  // pulp_created
  // pulp_labels
  // pulp_last_updated
  // sock_connect_timeout
  // sock_read_timeout
  // sync_dependencies
  // total_timeout

  hidden_fields: {
    is_set: boolean;
    name: string;
  }[];

  my_permissions?: string[];
}
