export class LegacyNamespaceListType {
  id: number;
  url: string;
  summary_fields: {
    owners?: { username: string }[];
    provider_namespaces?: { id: number; name: string; pulp_href: string }[];
  };
  created: string;
  modified: string;
  name: string;
  date_joined: string;
  avatar_url: string;
  active: boolean;
}

export class LegacyNamespaceDetailType {
  id: number;
  url: string;
  summary_fields: {
    owners?: { username: string }[];
    provider_namespaces?: { id: number; name: string; pulp_href: string }[];
  };
  created: string;
  modified: string;
  name: string;
  date_joined: string;
  avatar_url: string;
  active: boolean;
}
