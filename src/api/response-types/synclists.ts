export class SyncListType {
  id: number;
  name: string;
  policy: 'include' | 'exclude';
  collections: { namespace: string; name: string }[];
  namespaces: string[];
  users: string[];
  groups: string[];
}
