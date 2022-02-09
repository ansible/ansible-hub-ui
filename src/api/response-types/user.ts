export class InsightsUserType {
  account_number: string;
  internal: {
    account_id: number;
    org_id: string;
  };
  type: string;
  user: {
    email: string;
    first_name: string;
    is_active: boolean;
    is_internal: boolean;
    is_org_admin: boolean;
    last_name: string;
    locale: string;
    username: string;
  };
}

export class Permissions {
  add_group: boolean;
  add_namespace: boolean;
  upload_to_namespace: boolean;
  change_distribution: boolean;
  change_namespace: boolean;
  change_remote: boolean;
  move_collection: boolean;
  sign_collections_on_namespace: boolean;
  sign_collections_on_repository: boolean;
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

export class UserType {
  id?: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  groups: { id: number; name: string }[];
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
  groups: { id: number; name: string }[];
}
