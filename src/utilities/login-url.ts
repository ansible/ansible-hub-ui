// external login URL, assuming UI_EXETRNAL_LOGIN_URI and featureFlags.external_authentication are set
export const loginURL = (next) => {
  if (IS_GATEWAY && next) {
    return `/redirect/?next=${encodeURIComponent(next)}`;
  }

  return UI_EXTERNAL_LOGIN_URI;
};
