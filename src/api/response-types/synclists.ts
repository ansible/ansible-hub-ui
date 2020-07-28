export class SyncListType {
  id: number;
  name: string;
  policy: 'allowlist' | 'denylist';
  collections: { namespace: string; name: string }[];
  namespaces: string[];
  users: string[];
  groups: string[];
}
