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

export class UserType {
  id?: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  groups: { id: number; name: string }[];
  is_partner_engineer?: boolean;
  date_joined?: string;
  password?: string;
}

export class MeType {
  is_partner_engineer: boolean;
}
