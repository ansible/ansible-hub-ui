export class LegacyNamespaceListType {
  id: number;
  url: string;
  summary_fields: {
    owners?: { username: string }[];
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
  };
  created: string;
  modified: string;
  name: string;
  date_joined: string;
  avatar_url: string;
  active: boolean;
}
