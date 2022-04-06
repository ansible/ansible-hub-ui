import { GroupObjectPermissionType } from './permissions';

export class NamespaceLinkType {
  name: string;
  url: string;
}

export class NamespaceListType {
  id: number;
  name: string;
  company: string;
  email: string;
  avatar_url: string;
  description: string;
  num_collections: number;
}

export class NamespaceType extends NamespaceListType {
  groups: GroupObjectPermissionType[];
  resources: string;
  owners: string[];
  links: NamespaceLinkType[];
  related_fields: { my_permissions?: string[] };
}
