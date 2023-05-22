import { msg, t } from '@lingui/macro';

export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly CARD_DEFAULT_PAGE_SIZE = 10;
  static readonly CARD_DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly ADMIN_GROUP = 'system:partner-engineers';
  static PUBLISHED = 'published';

  static CERTIFIED_REPO = 'rh-certified';

  static NOTCERTIFIED = 'rejected';
  static NEEDSREVIEW = 'staging';

  static PERMISSIONS = [
    {
      name: 'namespaces',
      label: defineMessage({ message: `Collection Namespaces` }),
      object_permissions: [
        'galaxy.add_namespace', // model_permissions.add_namespace
        'galaxy.change_namespace', // (model_permissions.change_namespace)
        'galaxy.delete_namespace', // model_permissions.delete_namespace
        'galaxy.upload_to_namespace', // (model_permissions.upload_to_namespace)
      ],
    },
    {
      name: 'collections',
      label: defineMessage({ message: `Collections` }),
      object_permissions: [
        'ansible.modify_ansible_repo_content', // model_permissions.move_collection
        'ansible.delete_collection', // model_permissions.delete_collection
      ],
    },
    {
      name: 'users',
      label: defineMessage({ message: `Users` }),
      object_permissions: [
        'galaxy.view_user', // model_permissions.view_user
        'galaxy.delete_user', // model_permissions.delete_user
        'galaxy.add_user', // model_permissions.add_user
        'galaxy.change_user', // model_permissions.change_user
      ],
    },
    {
      name: 'groups',
      label: defineMessage({ message: `Groups` }),
      object_permissions: [
        'galaxy.view_group', // model_permissions.view_group
        'galaxy.delete_group', // model_permissions.delete_group
        'galaxy.add_group', // model_permissions.add_group
        'galaxy.change_group', // model_permissions.change_group
      ],
    },
    {
      name: 'remotes',
      label: defineMessage({ message: `Collection Remotes` }),
      object_permissions: [
        'ansible.change_collectionremote', // model_permissions.change_remote
        'ansible.view_collectionremote',
        // 'ansible.add_collectionremote', // (model_permissions.add_remote)
        // 'ansible.delete_collectionremote', // (model_permissions.delete_remote)
      ],
    },
    {
      name: 'containers',
      label: defineMessage({ message: `Containers` }),
      object_permissions: [
        // 'container.add_containerrepository', // (model_permissions.add_containerrepository)
        // 'container.change_containerrepository', // (model_permissions.change_containerrepository)
        'container.delete_containerrepository', // model_permissions.delete_containerrepository

        'container.namespace_change_containerdistribution',
        'container.namespace_modify_content_containerpushrepository',
        'container.namespace_push_containerdistribution',

        'container.add_containernamespace', // (model_permissions.add_containernamespace)
        'container.change_containernamespace', // (model_permissions.change_containernamespace)
        // 'container.delete_containernamespace', // (model_permissions.delete_containernamespace)
      ],
    },
    {
      name: 'registries',
      label: defineMessage({ message: `Remote Registries` }),
      object_permissions: [
        'galaxy.add_containerregistryremote', // model_permissions.add_containerregistry
        'galaxy.change_containerregistryremote', // model_permissions.change_containerregistry
        'galaxy.delete_containerregistryremote', // model_permissions.delete_containerregistry
      ],
    },
    {
      name: 'task_management',
      label: defineMessage({ message: `Task Management` }),
      object_permissions: [
        'core.change_task',
        'core.delete_task',
        'core.view_task',
      ],
    },
  ];

  static USER_GROUP_MGMT_PERMISSIONS = [
    'galaxy.delete_user',
    'galaxy.add_user',
    'galaxy.change_user',
    'galaxy.delete_group',
    'galaxy.add_group',
  ];

  static HUMAN_PERMISSIONS = {
    'ansible.add_ansibledistribution': t`Add Ansible distribution`,
    'ansible.add_collectionremote': t`Add collection remote`,
    'ansible.change_ansibledistribution': t`Change Ansible distribution`,
    'ansible.change_collectionremote': t`Change collection remote`,
    'ansible.delete_ansibledistribution': t`Delete Ansible distribution`,
    'ansible.delete_collection': t`Delete collection`,
    'ansible.delete_collectionremote': t`Delete collection remote`,
    'ansible.modify_ansible_repo_content': t`Modify Ansible repo content`,
    'ansible.view_ansibledistribution': t`View Ansible distribution`,
    'ansible.view_collectionremote': t`View collection remote`,
    'container.add_containerdistribution': t`Add container distribution`,
    'container.add_containernamespace': t`Create new containers`,
    'container.add_containerrepository': t`Add container repository`,
    'container.change_containerdistribution': t`Change container distribution`,
    'container.change_containernamespace': t`Change container namespace permissions`,
    'container.change_containerrepository': t`Change container repository`,
    'container.delete_containerdistribution': t`Delete container distribution`,
    'container.delete_containernamespace': t`Delete container namespace`,
    'container.delete_containerrepository': t`Delete container repository`,
    'container.namespace_change_containerdistribution': t`Change containers`,
    'container.namespace_modify_content_containerpushrepository': t`Change image tags`,
    'container.namespace_pull_containerdistribution': t`Pull private containers`,
    'container.namespace_push_containerdistribution': t`Push to existing containers`,
    'container.namespace_view_containerdistribution': t`View private containers`,
    'core.change_task': t`Change task`,
    'core.delete_task': t`Delete task`,
    'core.view_task': t`View all tasks`,
    'galaxy.add_containerregistryremote': t`Add remote registry`,
    'galaxy.add_group': t`Add group`,
    'galaxy.add_namespace': t`Add namespace`,
    'galaxy.add_synclist': t`Add synclist`,
    'galaxy.add_user': t`Add user`,
    'galaxy.change_containerregistryremote': t`Change remote registry`,
    'galaxy.change_group': t`Change group`,
    'galaxy.change_namespace': t`Change namespace`,
    'galaxy.change_synclist': t`Change synclist`,
    'galaxy.change_user': t`Change user`,
    'galaxy.delete_containerregistryremote': t`Delete remote registry`,
    'galaxy.delete_group': t`Delete group`,
    'galaxy.delete_namespace': t`Delete namespace`,
    'galaxy.delete_synclist': t`Delete synclist`,
    'galaxy.delete_user': t`Delete user`,
    'galaxy.upload_to_namespace': t`Upload to namespace`,
    'galaxy.view_group': t`View group`,
    'galaxy.view_synclist': t`View synclist`,
    'galaxy.view_user': t`View user`,
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
    published: defineMessage({ message: `Published` }),
    'rh-certified': defineMessage({ message: `Red Hat Certified` }),
    community: defineMessage({ message: `Community` }),
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
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': msg`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': msg`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_synclist_repository': msg`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': msg`Import and move to staging`,
    'galaxy_ng.app.tasks.import_and_auto_approve': msg`Import and auto approve`,
    'galaxy_ng.app.tasks.curate_all_synclist_repository': msg`Curate all synclist repository`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': msg`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.sync': msg`Pulp Ansible: Collections sync`,
    'pulp_ansible.app.tasks.copy.copy_content': msg`Pulp ansible: Copy content`,
    'pulp_ansible.app.tasks.collections.collection_sync': msg`Pulp ansible: collection sync`,
    'pulp_ansible.app.tasks.roles.synchronize': msg`Pulp Ansible: Roles synchronize`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': msg`Pulp ansible: Update collection remote`,
    'pulp_ansible.app.tasks.collections.import_collection': msg`Pulp ansible: Import collection`,
    'pulp_container.app.tasks.tag_image': msg`Pulp container: Tag image`,
    'pulp_container.app.tasks.untag_image': msg`Pulp container: Untage image`,
    'pulp_container.app.tasks.synchronize': msg`Pulp container: Tasks synchronize`,
    'pulp_container.app.tasks.recursive_add_content': msg`Pulp container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': msg`Pulp container: Recursive remove content`,
    'pulp_container.app.tasks.build_image_from_containerfile': msg`Pulp container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': msg`Pulp container: General multi delete`,
    'pulpcore.tasking.tasks.import_repository_version': msg`Pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': msg`Pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': msg`Pulpcore: Repair all artifacts`,
    'pulpcore.tasking.tasks.base.general_create': msg`Pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_update': msg`Pulpcore: General update`,
    'pulpcore.tasking.tasks.base.general_delete': msg`Pulpcore: General delete`,
    'pulpcore.app.tasks.export.pulp_export': msg`Pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': msg`Pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.delete_version': msg`Pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': msg`Pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': msg`Pulpcore: Upload commit`,
    'pulpcore.app.tasks.repository.add_and_remove': msg`Pulpcore: Add and remove`,
    'pulpcore.plugin.tasking.add_and_remove': msg`Pulpcore: Add or remove`,
  };

  static HUMAN_STATUS = {
    completed: t`Completed`,
    failed: t`Failed`,
    running: t`Running`,
    waiting: t`Waiting`,
  };
}
