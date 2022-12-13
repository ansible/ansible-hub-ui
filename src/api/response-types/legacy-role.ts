/*
{
	"id": 1,
	"created": "2022-04-12T03:40:14.210482Z",
	"modified": "2022-04-12T03:40:14.227106Z",
	"github_user": "geerlingguy",
	"github_repo": "ansible-role-memcached",
	"github_branch": "1.0.0",
	"commit": "a63ebf48564db594ad45d7e4a48079067c6621f0",
	"name": "memcached",
	"description": "Memcached for Linux",
	"summary_fields": {
		"dependencies": [],
		"namespace": {
			"id": 1,
			"name": "geerlingguy"
		},
		"provider_namespace": {
			"id": 1,
			"name": "geerlingguy"
		},
		"repository": {
			"name": "memcached",
			"original_name": "ansible-role-memcached"
		},
		"tags": [],
		"versions": [
			{
				"name": "1.0.0",
				"release_date": "2022-04-12T03:40:14.220596"
			}
		]
	}
},
*/

export class LegacyRoleListType {
  id: number;
  created: string;
  modified: string;
  github_user: string;
  github_repo: string;
  github_branch: string;
  commit: string;
  name: string;
  description: string;
  summary_fields: {
    dependencies: string[];
    namespace: {
      id: number;
      name: string;
      avatar_url: string;
    };
    provider_namespace: {
      id: number;
      name: string;
    };
    repository: {
      name: string;
      original_name: string;
    };
    tags: string[];
    versions: {
      name: string;
      release_date: string;
    }[];
  };
}

export class LegacyRoleDetailType {
  id: number;
  created: string;
  modified: string;
  github_user: string;
  github_repo: string;
  github_branch: string;
  commit: string;
  name: string;
  description: string;
  summary_fields: {
    dependencies: string[];
    namespace: {
      id: number;
      name: string;
      avatar_url: string;
    };
    provider_namespace: {
      id: number;
      name: string;
    };
    repository: {
      name: string;
      original_name: string;
    };
    tags: string[];
    versions: {
      name: string;
      release_date: string;
    }[];
  };
}

export class LegacyRoleVersionDetailType {
  id: number;
  url: string;
  related: unknown;
  summary_fields: unknown;
  created: string;
  modified: string;
  name: string;
  version: string;
  commit_date: string;
  commit_sha: string;
  download_url: string;
  active: boolean;
}
