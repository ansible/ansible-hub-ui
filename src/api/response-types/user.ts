export class Permissions {
  add_group: boolean;
  add_namespace: boolean;
  upload_to_namespace: boolean;
  change_distribution: boolean;
  change_namespace: boolean;
  change_remote: boolean;
  move_collection: boolean;
  view_distribution: boolean;
  view_group: boolean;
  view_user: boolean;
  delete_group: boolean;
  delete_user: boolean;
  change_group: boolean;
  change_user: boolean;
  add_user: boolean;
  delete_namespace: boolean;
  add_containerregistry: boolean;
  change_containerregistry: boolean;
  delete_containerregistry: boolean;
  delete_collection: boolean;
  delete_containerrepository: boolean;
}

export class GroupType {
  id: number;
  name: string;
  object_roles?: string[];
}

export class UserType {
  id?: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  groups: GroupType[];
  auth_provider?: [];
  date_joined?: string;
  password?: string;
  model_permissions?: Permissions;
  is_superuser?: boolean;
  is_anonymous?: boolean;
}

export class MeType {
  username: string;
  first_name?: string;
  last_name?: string;
  model_permissions: Permissions;
  groups: GroupType[];
}
