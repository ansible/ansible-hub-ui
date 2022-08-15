export class RoleType {
  pulp_href: string;
  pulp_created: string;
  name: string;
  description: string;
  permissions?: string[];
  locked: boolean;
}

export class GroupRoleType {
  pulp_href: string;
  pulp_created: string;
  role: string;
  description: string;
  permissions?: string[];
  content_object: string;
}
