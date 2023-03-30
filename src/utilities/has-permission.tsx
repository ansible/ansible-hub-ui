// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasPermission({ user, settings, featureFlags }, name) {
  if (!user?.model_permissions) {
    return false;
  }

  if (!user.model_permissions[name]) {
    console.error(`Unknown permission ${name}`);
    return !!user.is_superadmin;
  }

  return !!user.model_permissions[name].has_model_permission;
}
