// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasPermission({ user, settings, featureFlags }, name) {
  if (!user?.model_permissions) {
    return false;
  }
  const newToOld = {
    'ansible.modify_ansible_repo_content': 'move_collection',
    'ansible.delete_collection': 'delete_collection',
    'ansible.change_collectionremote': 'change_remote',
    'container.delete_containerrepository': 'delete_containerrepository',
    'container.change_containernamespace': 'change_containernamespace',
    'container.add_containernamespace': 'add_containernamespace',
    'galaxy.add_containerregistry': 'add_containerregistry',
    'galaxy.change_containerregistryremote': 'change_containerregistry',
    'galaxy.delete_containerregistryremote': 'delete_containerregistry',
    'galaxy.change_group': 'change_group',
    'galaxy.view_group': 'view_group',
    'galaxy.view_user': 'view_user',
    'galaxy.delete_group': 'delete_group',
    'galaxy.add_group': 'add_group',
    'galaxy.change_namespace': 'change_namespace',
    'galaxy.delete_namespace': 'delete_namespace',
    'galaxy.add_namespace': 'add_namespace',
    'core.view_task': 'view_task',
    'galaxy.add_user': 'add_user',
    'galaxy.change_user': 'change_user',
    'galaxy.delete_user': 'delete_user',
  };

  return !!user.model_permissions[newToOld[name]];
}
