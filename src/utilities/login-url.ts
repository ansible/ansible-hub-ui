// external login URL, assuming UI_EXETRNAL_LOGIN_URI and featureFlags.external_authentication are set
export const loginURL = (next, featureFlags) => {
  if (featureFlags.dab_resource_registry && next) {
    return `/redirect/?next=${encodeURIComponent(next)}`;
  }

  return UI_EXTERNAL_LOGIN_URI;
};
