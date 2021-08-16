export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly CARD_DEFAULT_PAGE_SIZE = 10;
  static readonly CARD_DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];
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
    {
      name: 'containers',
      object_permissions: [
        // Turning off private container permissions since they aren't supported yet
        // 'container.namespace_pull_containerdistribution',
        // 'container.namespace_view_containerdistribution',

        'container.namespace_change_containerdistribution',
        'container.namespace_modify_content_containerpushrepository',
        'container.change_containernamespace',
        'container.namespace_push_containerdistribution',
        'container.add_containernamespace',
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
  static USER_GROUP_MGMT_PERMISSIONS = [
    'galaxy.delete_user',
    'galaxy.add_user',
    'galaxy.change_user',
    'galaxy.delete_group',
    'galaxy.add_group',
  ];
  static HUMAN_PERMISSIONS = {
    'galaxy.add_namespace': _`Add namespace`,
    'galaxy.change_namespace': _`Change namespace`,
    'galaxy.upload_to_namespace': _`Upload to namespace`,
    'ansible.modify_ansible_repo_content': _`Modify Ansible repo content`,
    'galaxy.view_user': _`View user`,
    'galaxy.delete_user': _`Delete user`,
    'galaxy.add_user': _`Add user`,
    'galaxy.change_user': _`Change user`,
    'galaxy.view_group': _`View group`,
    'galaxy.delete_group': _`Delete group`,
    'galaxy.add_group': _`Add group`,
    'galaxy.change_group': _`Change group`,
    'ansible.change_collectionremote': _`Change collection remote`,
    'ansible.view_collectionremote': _`View collection remote`,
    'ansible.change_ansibledistribution': _`Change Ansible distribution`,
    'ansible.view_ansibledistribution': _`View Ansible distribution`,
    'galaxy.delete_synclist': _`Delete synclist`,
    'galaxy.change_synclist': _`Change synclist`,
    'galaxy.view_synclist': _`View synclist`,
    'galaxy.add_synclist': _`Add synclist`,
    'container.add_containernamespace': _`Create new containers`,
    'container.namespace_pull_containerdistribution': _`Pull private containers`,
    'container.namespace_change_containerdistribution': _`Change containers`,
    'container.namespace_view_containerdistribution': _`View private containers`,
    'container.namespace_modify_content_containerpushrepository': _`Change image tags`,
    'container.change_containernamespace': _`Change container namespace permissions`,
    'container.namespace_push_containerdistribution': _`Push to existing containers`,
  };
  static GROUP_HUMAN_PERMISSIONS = {
    change_namespace: _`Change namespace`,
    upload_to_namespace: _`Upload to namespace`,
    add_containernamespace: _`Create new containers`,
    namespace_pull_containerdistribution: _`Pull private containers`,
    namespace_change_containerdistribution: _`Update container information`,
    namespace_view_containerdistribution: _`View private containers`,
    namespace_modify_content_containerpushrepository: _`Change image tags`,
    change_containernamespace: _`Change container namespace permissions`,
    namespace_push_containerdistribution: _`Push images to existing containers`,
    view_containernamespace: _`View container's namespace`,
    delete_containernamespace: _`Delete container's namespace`,
    namespace_delete_containerdistribution: _`Delete container's distribution`,
    namespace_view_containerpushrepository: _`View container's repository`,
    namespace_add_containerdistribution: _`Push new containers`,
    change_containerdistribution: _`Change distribution`,
    delete_containerdistribution: _`Delete distribution`,
    push_containerdistribution: _`Push distribution`,
    pull_containerdistribution: _`Pull distribution`,
    view_containerdistribution: _`View distribution`,
  };
  static CONTAINER_NAMESPACE_PERMISSIONS = [
    'change_containernamespace',
    'namespace_push_containerdistribution',
    'namespace_change_containerdistribution',
    'namespace_modify_content_containerpushrepository',
    'namespace_add_containerdistribution',
  ];
  static UPSTREAM_HOSTS = [
    'galaxy.ansible.com',
    'galaxy-dev.ansible.com',
    'galaxy-qa.ansible.com',
  ];
  static DOWNSTREAM_HOSTS = [
    // FIXME 2021-09: remove obsolete cloud* references
    'cloud.redhat.com',
    'cloud.stage.redhat.com',
    'ci.cloud.redhat.com',
    'qa.cloud.redhat.com',

    'console.redhat.com',
    'console.stage.redhat.com',
    'ci.console.redhat.com',
    'qa.console.redhat.com',
  ];
  static REPOSITORYNAMES = {
    'Red Hat Certified': 'rh-certified',
    Community: 'community',
    Published: 'published',
  };

  static ALLOWEDREPOS = ['community', 'published', 'rh-certified'];

  static COLLECTION_FILTER_TAGS = [
    'application',
    'cloud',
    'database',
    'infrastructure',
    'linux',
    'monitoring',
    'networking',
    'security',
    'storage',
    'tools',
    'windows',
  ];

  static TASK_NAMES = {
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': _`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': _`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_synclist_repository': _`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': _`Import and move to staging`,
    'galaxy_ng.app.tasks.import_and_auto_approve': _`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_all_synclist_repository': _`Curate all synclist repository`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': _`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.sync': _`Pulp Ansible: Collections sync`,
    'pulp_ansible.app.tasks.copy.copy_content': _`Pulp ansible: Copy content`,
    'pulp_ansible.app.tasks.collections.collection_sync': _`Pulp ansible: collection sync`,
    'pulp_ansible.app.tasks.roles.synchronize': _`Pulp Ansible: Roles synchronize`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': _`Pulp ansible: Update collection remote`,
    'pulp_ansible.app.tasks.collections.import_collection': _`Pulp ansible: Import collection`,
    'pulp_container.app.tasks.tag_image': _`Pulp container: Tag image`,
    'pulp_container.app.tasks.untag_image': _`Pulp container: Untage image`,
    'pulp_container.app.tasks.synchronize': _`Pulp container: Tasks synchronize`,
    'pulp_container.app.tasks.recursive_add_content': _`Pulp container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': _`Pulp container: Recursive remove content`,
    'pulp_container.app.tasks.build_image_from_containerfile': _`Pulp container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': _`Pulp container: General multi delete`,
    'pulpcore.tasking.tasks.import_repository_version': _`Pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': _`Pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': _`Pulpcore: Repair all artifacts`,
    'pulpcore.tasking.tasks.base.general_create': _`Pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_update': _`Pulpcore: General update`,
    'pulpcore.tasking.tasks.base.general_delete': _`Pulpcore: General delete`,
    'pulpcore.app.tasks.export.pulp_export': _`Pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': _`Pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.delete_version': _`Pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': _`Pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': _`Pulpcore: Upload commit`,
    'pulpcore.app.tasks.repository.add_and_remove': _`Pulpcore: Add and remove`,
    'pulpcore.plugin.tasking.add_and_remove': _`Pulpcore: Add or remove`,
  };
}
