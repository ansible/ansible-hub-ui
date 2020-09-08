export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly CARD_DEFAULT_PAGE_SIZE = 12;
  static readonly CARD_DEFAULT_PAGINATION_OPTIONS = [12, 24, 60, 120];
  static readonly INSIGHTS_DEPLOYMENT_MODE = 'insights';
  static readonly STANDALONE_DEPLOYMENT_MODE = 'standalone';

  static readonly ADMIN_GROUP = 'system:partner-engineers';
  static CERTIFIED =
    DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
      ? 'automation-hub'
      : 'published';
  static NOTCERTIFIED = 'rejected';
  static NEEDSREVIEW = 'staging';
  static PERMISSIONS = [
    {
      name: 'namespaces',
      object_permissions: [
        'galaxy.add_namespace',
        'galaxy.change_namespace',
        'galaxy.upload_to_namespace',
      ],
    },
    {
      name: 'collections',
      object_permissions: ['ansible.modify_ansible_repo_content'],
    },
    {
      name: 'users',
      object_permissions: [
        'galaxy.view_user',
        'galaxy.delete_user',
        'galaxy.add_user',
        'galaxy.change_user',
      ],
    },
    {
      name: 'groups',
      object_permissions: [
        'galaxy.view_group',
        'galaxy.delete_group',
        'galaxy.add_group',
        'galaxy.change_group',
      ],
    },
    {
      name: 'remotes',
      object_permissions: [
        'ansible.change_collectionremote',
        'ansible.view_collectionremote',
      ],
    },
    {
      name: 'distribution',
      object_permissions: [
        'ansible.change_ansibledistribution',
        'ansible.view_ansibledistribution',
      ],
    },
    {
      name: 'synclists',
      object_permissions: [
        'galaxy.delete_synclist',
        'galaxy.change_synclist',
        'galaxy.view_synclist',
        'galaxy.add_synclist',
      ],
    },
  ];
  static UPSTREAM_HOSTS = [
    'galaxy.ansible.com',
    'galaxy-dev.ansible.com',
    'galaxy-qa.ansible.com',
  ];
  static DOWNSTREAM_HOSTS = ['cloud.redhat.com'];
  static REPOSITORYNAMES = {
    'Red Hat Certified': 'rh-certified',
    Community: 'community',
    Published: 'published',
  };
}
