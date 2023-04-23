import { FeatureFlagsType, SettingsType, UserType } from 'src/api';

export type PermissionContextType = (
  o: {
    featureFlags: FeatureFlagsType;
    settings?: SettingsType;
    user: UserType;
    hasPermission: (string) => boolean;
    hasObjectPermission?: (string, item?) => boolean;
  },
  item?,
) => boolean;

export const isLoggedIn: PermissionContextType = ({ user }) =>
  user && !user.is_anonymous;

const has_model_perms =
  (permission: string): PermissionContextType =>
  ({ hasPermission, user }) =>
    hasPermission(permission) || user?.is_superuser;

const has_model_or_obj_perms =
  (permission: string): PermissionContextType =>
  ({ hasPermission, hasObjectPermission, user }, item?) =>
    hasPermission(permission) ||
    hasObjectPermission?.(permission, item) ||
    user?.is_superuser;

// Ansible Remotes
export const canAddAnsibleRemote = has_model_perms(
  'ansible.add_collectionremote',
);
export const canDeleteAnsibleRemote = has_model_or_obj_perms(
  'ansible.delete_collectionremote',
);
export const canEditAnsibleRemote = has_model_or_obj_perms(
  'ansible.change_collectionremote',
);
export const canViewAnsibleRemotes = has_model_or_obj_perms(
  'ansible.view_collectionremote',
);
export const canEditAnsibleRemoteAccess = has_model_or_obj_perms(
  'ansible.manage_roles_collectionremote',
);

// Ansible Repositories
export const canAddAnsibleRepository = has_model_perms(
  'ansible.add_ansiblerepository',
);
export const canDeleteAnsibleRepository = has_model_or_obj_perms(
  'ansible.delete_ansiblerepository',
);
export const canEditAnsibleRepository = has_model_or_obj_perms(
  'ansible.change_ansiblerepository',
);
export const canSyncAnsibleRepository = canEditAnsibleRepository;
// everybody can list/view, not has_model_or_obj_perms('ansible.view_ansiblerepository'); under feature flag
export const canViewAnsibleRepositories = ({ user, featureFlags }) =>
  user && featureFlags?.display_repositories;
export const canEditAnsibleRepositoryAccess = has_model_or_obj_perms(
  'ansible.manage_roles_ansiblerepository',
);

// Ansible Repository Versions
// simulating has_repository_model_or_obj_perms by passing in repository as item
export const canRevertAnsibleRepositoryVersion = canEditAnsibleRepository;
