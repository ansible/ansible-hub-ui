import { msg } from '@lingui/macro';

export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';

  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static CERTIFIED_REPO = IS_INSIGHTS ? 'published' : 'rh-certified';

  static USER_GROUP_MGMT_PERMISSIONS = [
    'galaxy.delete_user',
    'galaxy.add_user',
    'galaxy.change_user',
    'galaxy.delete_group',
    'galaxy.add_group',
  ];

  static PROTECTED_REPOSITORIES = [
    'rh-certified',
    'validated',
    'community',
    'published',
    'staging',
    'rejected',
  ];

  static TASK_NAMES = {
    'galaxy_ng.app.tasks.curate_all_synclist_repository': msg`Curate all synclist repositories`,
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

  static LOCKED_ROLES_WITH_DESCRIPTION = {
    // galaxy roles
    'galaxy.ansible_repository_owner': msg`Manage ansible repositories.`,
    'galaxy.collection_admin': msg`Create, delete and change collection namespaces. Upload and delete collections. Sync collections from remotes. Approve and reject collections.`,
    'galaxy.collection_curator': msg`Approve, reject and sync collections from remotes.`,
    'galaxy.collection_namespace_owner': msg`Change and upload collections to namespaces.`,
    'galaxy.collection_publisher': msg`Upload and modify collections.`,
    'galaxy.collection_remote_owner': msg`Manage collection remotes.`,
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
