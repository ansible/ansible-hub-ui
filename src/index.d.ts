// Fool TypeScript into thinking that we actually have typings for these components.
// This will tell typescript that anything from this module is of type any.

declare module '*.svg';

// Declare configuration globals here so that TypeScript compiles
/* eslint-disable no-var */
declare var API_BASE_PATH;
declare var API_HOST;
declare var APPLICATION_NAME;
declare var PULP_API_BASE_PATH;
declare var UI_BASE_PATH;
declare var UI_COMMIT_HASH;
declare var UI_EXTERNAL_LOGIN_URI;
