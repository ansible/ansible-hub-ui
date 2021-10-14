import { t } from '@lingui/macro';
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
      label: t`Namespaces`,
      object_permissions: [
        'galaxy.add_namespace',
        'galaxy.change_namespace',
        'galaxy.upload_to_namespace',
      ],
    },
    {
      name: 'collections',
      label: t`Collections`,
      object_permissions: [
        'ansible.modify_ansible_repo_content',
      ],
    },
    {
      name: 'users',
      label: t`Users`,
      object_permissions: [
        'galaxy.view_user',
        'galaxy.delete_user',
        'galaxy.add_user',
        'galaxy.change_user',
      ],
    },
    {
      name: 'groups',
      label: t`Groups`,
      object_permissions: [
        'galaxy.view_group',
        'galaxy.delete_group',
        'galaxy.add_group',
        'galaxy.change_group',
      ],
    },
    {
      name: 'remotes',
      label: t`Remotes`,
      object_permissions: [
        'ansible.change_collectionremote',
        'ansible.view_collectionremote',
      ],
    },
    {
      name: 'containers',
      label: t`Containers`,
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
    'galaxy.add_namespace': t`Add namespace`,
    'galaxy.change_namespace': t`Change namespace`,
    'galaxy.upload_to_namespace': t`Upload to namespace`,
    'ansible.modify_ansible_repo_content': t`Modify Ansible repo content`,
    'galaxy.view_user': t`View user`,
    'galaxy.delete_user': t`Delete user`,
    'galaxy.add_user': t`Add user`,
    'galaxy.change_user': t`Change user`,
    'galaxy.view_group': t`View group`,
    'galaxy.delete_group': t`Delete group`,
    'galaxy.add_group': t`Add group`,
    'galaxy.change_group': t`Change group`,
    'ansible.change_collectionremote': t`Change collection remote`,
    'ansible.view_collectionremote': t`View collection remote`,
    'ansible.change_ansibledistribution': t`Change Ansible distribution`,
    'ansible.view_ansibledistribution': t`View Ansible distribution`,
    'galaxy.delete_synclist': t`Delete synclist`,
    'galaxy.change_synclist': t`Change synclist`,
    'galaxy.view_synclist': t`View synclist`,
    'galaxy.add_synclist': t`Add synclist`,
    'container.add_containernamespace': t`Create new containers`,
    'container.namespace_pull_containerdistribution': t`Pull private containers`,
    'container.namespace_change_containerdistribution': t`Change containers`,
    'container.namespace_view_containerdistribution': t`View private containers`,
    'container.namespace_modify_content_containerpushrepository': t`Change image tags`,
    'container.change_containernamespace': t`Change container namespace permissions`,
    'container.namespace_push_containerdistribution': t`Push to existing containers`,
  };
  static GROUP_HUMAN_PERMISSIONS = {
    change_namespace: t`Change namespace`,
    upload_to_namespace: t`Upload to namespace`,
    add_containernamespace: t`Create new containers`,
    namespace_pull_containerdistribution: t`Pull private containers`,
    namespace_change_containerdistribution: t`Update container information`,
    namespace_view_containerdistribution: t`View private containers`,
    namespace_modify_content_containerpushrepository: t`Change image tags`,
    change_containernamespace: t`Change container namespace permissions`,
    namespace_push_containerdistribution: t`Push images to existing containers`,
    view_containernamespace: t`View container's namespace`,
    delete_containernamespace: t`Delete container's namespace`,
    namespace_delete_containerdistribution: t`Delete container's distribution`,
    namespace_view_containerpushrepository: t`View container's repository`,
    namespace_add_containerdistribution: t`Push new containers`,
    change_containerdistribution: t`Change distribution`,
    delete_containerdistribution: t`Delete distribution`,
    push_containerdistribution: t`Push distribution`,
    pull_containerdistribution: t`Pull distribution`,
    view_containerdistribution: t`View distribution`,
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
    published: t`Published`,
    'rh-certified': t`Red Hat Certified`,
    community: t`Community`,
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

  static COLLECTION_PLURAL_LABELS = {
    dependency: {
      '0': 'dependencies',
      '1': 'dependency',
      other: 'dependencies',
    },
  };

  static TASK_NAMES = {
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': t`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_synclist_repository': t`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': t`Import and move to staging`,
    'galaxy_ng.app.tasks.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_all_synclist_repository': t`Curate all synclist repository`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': t`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.sync': t`Pulp Ansible: Collections sync`,
    'pulp_ansible.app.tasks.copy.copy_content': t`Pulp ansible: Copy content`,
    'pulp_ansible.app.tasks.collections.collection_sync': t`Pulp ansible: collection sync`,
    'pulp_ansible.app.tasks.roles.synchronize': t`Pulp Ansible: Roles synchronize`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': t`Pulp ansible: Update collection remote`,
    'pulp_ansible.app.tasks.collections.import_collection': t`Pulp ansible: Import collection`,
    'pulp_container.app.tasks.tag_image': t`Pulp container: Tag image`,
    'pulp_container.app.tasks.untag_image': t`Pulp container: Untage image`,
    'pulp_container.app.tasks.synchronize': t`Pulp container: Tasks synchronize`,
    'pulp_container.app.tasks.recursive_add_content': t`Pulp container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': t`Pulp container: Recursive remove content`,
    'pulp_container.app.tasks.build_image_from_containerfile': t`Pulp container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': t`Pulp container: General multi delete`,
    'pulpcore.tasking.tasks.import_repository_version': t`Pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': t`Pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': t`Pulpcore: Repair all artifacts`,
    'pulpcore.tasking.tasks.base.general_create': t`Pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_update': t`Pulpcore: General update`,
    'pulpcore.tasking.tasks.base.general_delete': t`Pulpcore: General delete`,
    'pulpcore.app.tasks.export.pulp_export': t`Pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': t`Pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.delete_version': t`Pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': t`Pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': t`Pulpcore: Upload commit`,
    'pulpcore.app.tasks.repository.add_and_remove': t`Pulpcore: Add and remove`,
    'pulpcore.plugin.tasking.add_and_remove': t`Pulpcore: Add or remove`,
  };

  static HUMAN_STATUS = {
    completed: t`Completed`,
    failed: t`Failed`,
    running: t`Running`,
    waiting: t`Waiting`,
  };
}
