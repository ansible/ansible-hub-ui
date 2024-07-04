// external login URL, assuming UI_EXETRNAL_LOGIN_URI and featureFlags.external_authentication are set
export const loginURL = (_next) => {
  // FIXME: next ? `?next=${encodeURIComponent(`${UI_BASE_PATH}/${next}`.replaceAll(/\/+/g, '/'))}` : ''
  return UI_EXTERNAL_LOGIN_URI;
};
