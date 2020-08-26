import { GroupObjectPermissionType } from './permissions';

export class NamespaceLink {
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
  owners: any[];
  links: NamespaceLink[];
}
