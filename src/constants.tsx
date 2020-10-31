export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly CARD_DEFAULT_PAGE_SIZE = 12;
  static readonly CARD_DEFAULT_PAGINATION_OPTIONS = [12, 24, 60, 120];
  static readonly INSIGHTS_DEPLOYMENT_MODE = 'insights';
  static readonly STANDALONE_DEPLOYMENT_MODE = 'standalone';

  static readonly ADMIN_GROUP = 'system:partner-engineers';
  static PUBLISHED = 'published';

  static CERTIFIED_REPO =
    DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
      ? 'published'
      : 'rh-certified';

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
    // These aren't currently used. Removing them to reduce confusion in the UI
    // {
    //   name: 'distribution',
    //   object_permissions: [
    //     'ansible.change_ansibledistribution',
    //     'ansible.view_ansibledistribution',
    //   ],
    // },
    // {
    //   name: 'synclists',
    //   object_permissions: [
    //     'galaxy.delete_synclist',
    //     'galaxy.change_synclist',
    //     'galaxy.view_synclist',
    //     'galaxy.add_synclist',
    //   ],
    // },
  ];
  static HUMAN_PERMISSIONS = {
    'galaxy.add_namespace': 'Add namespace',
    'galaxy.change_namespace': 'Change namespace',
    'galaxy.upload_to_namespace': 'Upload to namespace',
    'ansible.modify_ansible_repo_content': 'Modify Ansible repo content',
    'galaxy.view_user': 'View user',
    'galaxy.delete_user': 'Delete user',
    'galaxy.add_user': 'Add user',
    'galaxy.change_user': 'Change user',
    'galaxy.view_group': 'View group',
    'galaxy.delete_group': 'Delete group',
    'galaxy.add_group': 'Add group',
    'galaxy.change_group': 'Change group',
    'ansible.change_collectionremote': 'Change collection remote',
    'ansible.view_collectionremote': 'View collection remote',
    'ansible.change_ansibledistribution': 'Change Ansible distribution',
    'ansible.view_ansibledistribution': 'View Ansible distribution',
    'galaxy.delete_synclist': 'Delete synclist',
    'galaxy.change_synclist': 'Change synclist',
    'galaxy.view_synclist': 'View synclist',
    'galaxy.add_synclist': 'Add synclist',
  };
  static GROUP_HUMAN_PERMISSIONS = {
    change_namespace: 'Change namespace',
    upload_to_namespace: 'Upload to namespace',
  };
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

  static ALLOWEDREPOS = ['community', 'published', 'rh-certified'];
}
