export class LegacyRoleListType {
  id: string;
  name: string;
  description: string;
  // download_count: number;
  deprecated: boolean;
  latest_version: string;
  sign_state: 'unsigned' | 'signed' | 'partial';

  namespace: {
    id: number;
    description: string;
    name: string;
    avatar_url: string;
    company: string;
  };
}
