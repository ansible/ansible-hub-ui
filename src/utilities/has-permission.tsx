// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasPermission({ user, settings, featureFlags }, name) {
  if (!user?.model_permissions) {
    return false;
  }

  return !!user.model_permissions[name].has_model_permission;
}
