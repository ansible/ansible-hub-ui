export class ModelPermissionsType {
  [key: string]: {
    global_description: string;
    has_model_permission: boolean;
    name: string;
    object_description: string;
    ui_category: string;
  };
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
  model_permissions?: ModelPermissionsType;
  is_superuser?: boolean;
  is_anonymous?: boolean;
}
