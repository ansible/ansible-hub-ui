import { msg } from '@lingui/macro';

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
  static APPROVED = 'approved';

  static PERMISSIONS = [
    {
      name: 'namespaces',
      label: msg`Collection Namespaces`,
      object_permissions: [
        'galaxy.add_namespace', // model_permissions.add_namespace
        'galaxy.change_namespace', // (model_permissions.change_namespace)
        'galaxy.delete_namespace', // model_permissions.delete_namespace
        'galaxy.upload_to_namespace', // (model_permissions.upload_to_namespace)
      ],
    },
    {
      name: 'collections',
      label: msg`Collections`,
      object_permissions: [
        'ansible.modify_ansible_repo_content', // model_permissions.move_collection
        'ansible.delete_collection', // model_permissions.delete_collection
      ],
    },
    {
      name: 'users',
      label: msg`Users`,
      object_permissions: [
        'galaxy.view_user', // model_permissions.view_user
        'galaxy.delete_user', // model_permissions.delete_user
        'galaxy.add_user', // model_permissions.add_user
        'galaxy.change_user', // model_permissions.change_user
      ],
    },
    {
      name: 'groups',
      label: msg`Groups`,
      object_permissions: [
        'galaxy.view_group', // model_permissions.view_group
        'galaxy.delete_group', // model_permissions.delete_group
        'galaxy.add_group', // model_permissions.add_group
        'galaxy.change_group', // model_permissions.change_group
      ],
    },
    {
      name: 'remotes',
      label: msg`Collection Remotes`,
      object_permissions: [
        'ansible.change_collectionremote', // model_permissions.change_remote
        'ansible.view_collectionremote',
        // 'ansible.add_collectionremote', // (model_permissions.add_remote)
        // 'ansible.delete_collectionremote', // (model_permissions.delete_remote)
      ],
    },
    {
      name: 'containers',
      label: msg`Containers`,
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
      label: msg`Remote Registries`,
      object_permissions: [
        'galaxy.add_containerregistryremote', // model_permissions.add_containerregistry
        'galaxy.change_containerregistryremote', // model_permissions.change_containerregistry
        'galaxy.delete_containerregistryremote', // model_permissions.delete_containerregistry
      ],
    },
    {
      name: 'task_management',
      label: msg`Task Management`,
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
    'ansible.add_ansibledistribution': msg`Add Ansible distribution`,
    'ansible.add_collectionremote': msg`Add collection remote`,
    'ansible.change_ansibledistribution': msg`Change Ansible distribution`,
    'ansible.change_collectionremote': msg`Change collection remote`,
    'ansible.delete_ansibledistribution': msg`Delete Ansible distribution`,
    'ansible.delete_collection': msg`Delete collection`,
    'ansible.delete_collectionremote': msg`Delete collection remote`,
    'ansible.modify_ansible_repo_content': msg`Modify Ansible repo content`,
    'ansible.view_ansibledistribution': msg`View Ansible distribution`,
    'ansible.view_collectionremote': msg`View collection remote`,
    'container.add_containerdistribution': msg`Add container distribution`,
    'container.add_containernamespace': msg`Create new containers`,
    'container.add_containerrepository': msg`Add container repository`,
    'container.change_containerdistribution': msg`Change container distribution`,
    'container.change_containernamespace': msg`Change container namespace permissions`,
    'container.change_containerrepository': msg`Change container repository`,
    'container.delete_containerdistribution': msg`Delete container distribution`,
    'container.delete_containernamespace': msg`Delete container namespace`,
    'container.delete_containerrepository': msg`Delete container repository`,
    'container.namespace_change_containerdistribution': msg`Change containers`,
    'container.namespace_modify_content_containerpushrepository': msg`Change image tags`,
    'container.namespace_pull_containerdistribution': msg`Pull private containers`,
    'container.namespace_push_containerdistribution': msg`Push to existing containers`,
    'container.namespace_view_containerdistribution': msg`View private containers`,
    'core.change_task': msg`Change task`,
    'core.delete_task': msg`Delete task`,
    'core.view_task': msg`View all tasks`,
    'galaxy.add_containerregistryremote': msg`Add remote registry`,
    'galaxy.add_group': msg`Add group`,
    'galaxy.add_namespace': msg`Add namespace`,
    'galaxy.add_synclist': msg`Add synclist`,
    'galaxy.add_user': msg`Add user`,
    'galaxy.change_containerregistryremote': msg`Change remote registry`,
    'galaxy.change_group': msg`Change group`,
    'galaxy.change_namespace': msg`Change namespace`,
    'galaxy.change_synclist': msg`Change synclist`,
    'galaxy.change_user': msg`Change user`,
    'galaxy.delete_containerregistryremote': msg`Delete remote registry`,
    'galaxy.delete_group': msg`Delete group`,
    'galaxy.delete_namespace': msg`Delete namespace`,
    'galaxy.delete_synclist': msg`Delete synclist`,
    'galaxy.delete_user': msg`Delete user`,
    'galaxy.upload_to_namespace': msg`Upload to namespace`,
    'galaxy.view_group': msg`View group`,
    'galaxy.view_synclist': msg`View synclist`,
    'galaxy.view_user': msg`View user`,
  };

  static GROUP_HUMAN_PERMISSIONS = {
    change_namespace: msg`Change namespace`,
    upload_to_namespace: msg`Upload to namespace`,
    add_containernamespace: msg`Create new containers`,
    namespace_pull_containerdistribution: msg`Pull private containers`,
    namespace_change_containerdistribution: msg`Update container information`,
    namespace_view_containerdistribution: msg`View private containers`,
    namespace_modify_content_containerpushrepository: msg`Change image tags`,
    change_containernamespace: msg`Change container namespace permissions`,
    namespace_push_containerdistribution: msg`Push images to existing containers`,
    view_containernamespace: msg`View container's namespace`,
    delete_containernamespace: msg`Delete container's namespace`,
    namespace_delete_containerdistribution: msg`Delete container's distribution`,
    namespace_view_containerpushrepository: msg`View container's repository`,
    namespace_add_containerdistribution: msg`Push new containers`,
    change_containerdistribution: msg`Change distribution`,
    delete_containerdistribution: msg`Delete distribution`,
    push_containerdistribution: msg`Push distribution`,
    pull_containerdistribution: msg`Pull distribution`,
    view_containerdistribution: msg`View distribution`,
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
    'console.redhat.com',
    'console.stage.redhat.com',
    'ci.console.redhat.com',
    'qa.console.redhat.com',
  ];

  static REPOSITORYNAMES = {
    published: msg`Published`,
    'rh-certified': msg`Red Hat Certified`,
    community: msg`Community`,
    validated: msg`Validated`,
  };

  static ALLOWEDREPOS = ['community', 'published', 'rh-certified', 'validated'];

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
    'galaxy_ng.app.tasks.curate_all_synclist_repository': msg`Curate all synclist repository`,
    'galaxy_ng.app.tasks.curate_synclist_repository': msg`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_auto_approve': msg`Import and auto approve`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': msg`Import and move to staging`,
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': msg`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': msg`Import and auto approve`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': msg`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.collection_sync': msg`Pulp ansible: collection sync`,
    'pulp_ansible.app.tasks.collections.import_collection': msg`Pulp ansible: Import collection`,
    'pulp_ansible.app.tasks.collections.sync': msg`Pulp Ansible: Collections sync`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': msg`Pulp ansible: Update collection remote`,
    'pulp_ansible.app.tasks.copy.copy_content': msg`Pulp ansible: Copy content`,
    'pulp_ansible.app.tasks.roles.synchronize': msg`Pulp Ansible: Roles synchronize`,
    'pulp_container.app.tasks.build_image_from_containerfile': msg`Pulp container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': msg`Pulp container: General multi delete`,
    'pulp_container.app.tasks.recursive_add_content': msg`Pulp container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': msg`Pulp container: Recursive remove content`,
    'pulp_container.app.tasks.synchronize': msg`Pulp container: Tasks synchronize`,
    'pulp_container.app.tasks.tag_image': msg`Pulp container: Tag image`,
    'pulp_container.app.tasks.untag_image': msg`Pulp container: Untage image`,
    'pulpcore.app.tasks.export.pulp_export': msg`Pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': msg`Pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.add_and_remove': msg`Pulpcore: Add and remove`,
    'pulpcore.app.tasks.repository.delete_version': msg`Pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': msg`Pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': msg`Pulpcore: Upload commit`,
    'pulpcore.plugin.tasking.add_and_remove': msg`Pulpcore: Add or remove`,
    'pulpcore.tasking.tasks.base.general_create': msg`Pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_delete': msg`Pulpcore: General delete`,
    'pulpcore.tasking.tasks.base.general_update': msg`Pulpcore: General update`,
    'pulpcore.tasking.tasks.import_repository_version': msg`Pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': msg`Pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': msg`Pulpcore: Repair all artifacts`,
  };

  static HUMAN_STATUS = {
    completed: msg`Completed`,
    failed: msg`Failed`,
    running: msg`Running`,
    waiting: msg`Waiting`,
  };

  static LOCKED_ROLES_WITH_DESCRIPTION = {
    // galaxy roles
    'galaxy.collection_admin': msg`Create, delete and change collection namespaces. Upload and delete collections. Sync collections from remotes. Approve and reject collections.`,
    'galaxy.collection_curator': msg`Approve, reject and sync collections from remotes.`,
    'galaxy.collection_namespace_owner': msg`Change and upload collections to namespaces.`,
    'galaxy.collection_publisher': msg`Upload and modify collections.`,
    'galaxy.content_admin': msg`Manage all content types.`,
    'galaxy.execution_environment_admin': msg`Push, delete, and change execution environments. Create, delete and change remote registries.`,
    'galaxy.execution_environment_collaborator': msg`Change existing execution environments.`,
    'galaxy.execution_environment_namespace_owner': msg`Create and update execution environments under existing container namespaces.`,
    'galaxy.execution_environment_publisher': msg`Push, and change execution environments.`,
    'galaxy.group_admin': msg`View, add, remove and change groups.`,
    'galaxy.synclist_owner': msg`View, add, remove and change synclists.`,
    'galaxy.task_admin': msg`View, and cancel any task.`,
    'galaxy.user_admin': msg`View, add, remove and change users.`,

    // core roles
    'core.task_owner': msg`Allow all actions on a task.`,
    'core.taskschedule_owner': msg`Allow all actions on a taskschedule.`,
  };
}
