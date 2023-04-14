import { defineMessage, t } from '@lingui/macro';

export class Constants {
  static readonly SEARCH_VIEW_TYPE_LOCAL_KEY = 'search_view_type';
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];

  static readonly CARD_DEFAULT_PAGE_SIZE = 10;
  static readonly CARD_DEFAULT_PAGINATION_OPTIONS = [10, 20, 50, 100];
  static readonly INSIGHTS_DEPLOYMENT_MODE = 'insights';
  static readonly STANDALONE_DEPLOYMENT_MODE = 'standalone';

  static CERTIFIED_REPO =
    DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
      ? 'published'
      : 'rh-certified';

  static NOTCERTIFIED = 'rejected';
  static NEEDSREVIEW = 'staging';

  static APPROVED = 'approved';

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
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository':
      defineMessage({ message: `Remove content from repository` }),
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': defineMessage({
      message: `Import and auto approve`,
    }),
    'galaxy_ng.app.tasks.curate_synclist_repository': defineMessage({
      message: `Curate synclist repository`,
    }),
    'galaxy_ng.app.tasks.import_and_move_to_staging': defineMessage({
      message: `Import and move to staging`,
    }),
    'galaxy_ng.app.tasks.import_and_auto_approve': defineMessage({
      message: `Import and auto approve`,
    }),
    'galaxy_ng.app.tasks.curate_all_synclist_repository': defineMessage({
      message: `Curate all synclist repository`,
    }),
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch':
      defineMessage({ message: `Curate synclist repository batch` }),
    'pulp_ansible.app.tasks.collections.sync': defineMessage({
      message: `Pulp Ansible: Collections sync`,
    }),
    'pulp_ansible.app.tasks.copy.copy_content': defineMessage({
      message: `Pulp ansible: Copy content`,
    }),
    'pulp_ansible.app.tasks.collections.collection_sync': defineMessage({
      message: `Pulp ansible: collection sync`,
    }),
    'pulp_ansible.app.tasks.roles.synchronize': defineMessage({
      message: `Pulp Ansible: Roles synchronize`,
    }),
    'pulp_ansible.app.tasks.collections.update_collection_remote':
      defineMessage({ message: `Pulp ansible: Update collection remote` }),
    'pulp_ansible.app.tasks.collections.import_collection': defineMessage({
      message: `Pulp ansible: Import collection`,
    }),
    'pulp_container.app.tasks.tag_image': defineMessage({
      message: `Pulp container: Tag image`,
    }),
    'pulp_container.app.tasks.untag_image': defineMessage({
      message: `Pulp container: Untage image`,
    }),
    'pulp_container.app.tasks.synchronize': defineMessage({
      message: `Pulp container: Tasks synchronize`,
    }),
    'pulp_container.app.tasks.recursive_add_content': defineMessage({
      message: `Pulp container: Recursive add content`,
    }),
    'pulp_container.app.tasks.recursive_remove_content': defineMessage({
      message: `Pulp container: Recursive remove content`,
    }),
    'pulp_container.app.tasks.build_image_from_containerfile': defineMessage({
      message: `Pulp container: Build image from containerfile`,
    }),
    'pulp_container.app.tasks.general_multi_delete': defineMessage({
      message: `Pulp container: General multi delete`,
    }),
    'pulpcore.tasking.tasks.import_repository_version': defineMessage({
      message: `Pulpcore: Import repository version`,
    }),
    'pulpcore.tasking.tasks.orphan_cleanup': defineMessage({
      message: `Pulpcore: Orphan cleanup`,
    }),
    'pulpcore.tasking.tasks.repair_all_artifacts': defineMessage({
      message: `Pulpcore: Repair all artifacts`,
    }),
    'pulpcore.tasking.tasks.base.general_create': defineMessage({
      message: `Pulpcore: General create`,
    }),
    'pulpcore.tasking.tasks.base.general_update': defineMessage({
      message: `Pulpcore: General update`,
    }),
    'pulpcore.tasking.tasks.base.general_delete': defineMessage({
      message: `Pulpcore: General delete`,
    }),
    'pulpcore.app.tasks.export.pulp_export': defineMessage({
      message: `Pulpcore: Pulp export`,
    }),
    'pulpcore.app.tasks.pulp_import': defineMessage({
      message: `Pulpcore: Pulp import`,
    }),
    'pulpcore.app.tasks.repository.delete_version': defineMessage({
      message: `Pulpcore: Delete version`,
    }),
    'pulpcore.app.tasks.repository.repair_version': defineMessage({
      message: `Pulpcore: Repair version`,
    }),
    'pulpcore.app.tasks.upload.commit': defineMessage({
      message: `Pulpcore: Upload commit`,
    }),
    'pulpcore.app.tasks.repository.add_and_remove': defineMessage({
      message: `Pulpcore: Add and remove`,
    }),
    'pulpcore.plugin.tasking.add_and_remove': defineMessage({
      message: `Pulpcore: Add or remove`,
    }),
  };

  static LOCKED_ROLES_WITH_DESCRIPTION = {
    // galaxy roles
    'galaxy.ansible_repository_owner': t`Manage ansible repositories.`,
    'galaxy.collection_admin': t`Create, delete and change collection namespaces. Upload and delete collections. Sync collections from remotes. Approve and reject collections.`,
    'galaxy.collection_curator': t`Approve, reject and sync collections from remotes.`,
    'galaxy.collection_namespace_owner': t`Change and upload collections to namespaces.`,
    'galaxy.collection_publisher': t`Upload and modify collections.`,
    'galaxy.collection_remote_owner': t`Manage collection remotes.`,
    'galaxy.content_admin': t`Manage all content types.`,
    'galaxy.execution_environment_admin': t`Push, delete, and change execution environments. Create, delete and change remote registries.`,
    'galaxy.execution_environment_collaborator': t`Change existing execution environments.`,
    'galaxy.execution_environment_namespace_owner': t`Create and update execution environments under existing container namespaces.`,
    'galaxy.execution_environment_publisher': t`Push, and change execution environments.`,
    'galaxy.group_admin': t`View, add, remove and change groups.`,
    'galaxy.synclist_owner': t`View, add, remove and change synclists.`,
    'galaxy.task_admin': t`View, and cancel any task.`,
    'galaxy.user_admin': t`View, add, remove and change users.`,

    // core roles
    'core.task_owner': t`Allow all actions on a task.`,
    'core.taskschedule_owner': t`Allow all actions on a taskschedule.`,
  };
}
