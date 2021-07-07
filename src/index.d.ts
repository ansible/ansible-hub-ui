// Fool TypeScript into thinking that we actually have typings for these components.
// This will tell typescript that anything from this module is of type any.

declare module 'react-markdown';
declare module 'react-router-hash-link';
declare module 'file-saver';
declare module '*.gif';
declare module '*.svg';

// Declare configuration globals here so that TypeScript compiles
declare var API_HOST;
declare var API_BASE_PATH;
declare var UI_BASE_PATH;
declare var DEPLOYMENT_MODE;
declare var NAMESPACE_TERM;
declare var APPLICATION_NAME;
