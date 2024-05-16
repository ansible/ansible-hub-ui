// external login URL, assuming UI_EXETRNAL_LOGIN_URI and featureFlags.external_authentication are set
export const loginURL = (next, featureFlags) => {
  if (featureFlags.dab_resource_registry && next) {
    const fullPath = `${UI_BASE_PATH}/${next}`.replaceAll(/\/+/g, '/');
    return `/redirect/?next=${encodeURIComponent(fullPath)}`;
  }

  return UI_EXTERNAL_LOGIN_URI;
};
